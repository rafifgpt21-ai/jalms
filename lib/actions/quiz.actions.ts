"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { unlink } from "fs/promises"
import path from "path"

// --- Quiz Actions ---

export async function getQuizzes(teacherId?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        // If teacherId is not provided, use the current user's ID
        // (Assuming teacher can only see their own quizzes for now)
        const targetTeacherId = teacherId || session.user.id;

        const quizzes = await db.quiz.findMany({
            where: {
                teacherId: targetTeacherId,
                deletedAt: { isSet: false }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                _count: {
                    select: { questions: true }
                }
            }
        })
        return { quizzes }
    } catch (error) {
        console.error("Error fetching quizzes:", error)
        return { error: "Failed to fetch quizzes" }
    }
}

export async function getQuiz(quizId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        choices: {
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        })

        if (!quiz) return { error: "Quiz not found" }
        if (quiz.teacherId !== session.user.id) return { error: "Unauthorized access to this quiz" }

        return { quiz }

    } catch (error) {
        console.error("Error fetching quiz:", error)
        return { error: "Failed to fetch quiz" }
    }
}

export async function createQuiz(title: string, description?: string, randomizeChoices: boolean = false) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const quiz = await db.quiz.create({
            data: {
                title,
                description,
                randomizeChoices,
                teacherId: session.user.id
            }
        })

        revalidatePath("/teacher/quiz-manager")
        return { quiz }
    } catch (error) {
        console.error("Error creating quiz:", error)
        return { error: "Failed to create quiz" }
    }
}

export async function updateQuiz(quizId: string, data: { title?: string, description?: string, randomizeChoices?: boolean }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const quiz = await db.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) return { error: "Quiz not found" };
        if (quiz.teacherId !== session.user.id) return { error: "Unauthorized" };

        const updatedQuiz = await db.quiz.update({
            where: { id: quizId },
            data: {
                ...data
            }
        })

        revalidatePath("/teacher/quiz-manager")
        revalidatePath(`/teacher/quiz-manager/${quizId}`)
        return { quiz: updatedQuiz }
    } catch (error) {
        console.error("Error updating quiz:", error)
        return { error: "Failed to update quiz" }
    }
}

export async function deleteQuiz(quizId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const quiz = await db.quiz.findUnique({
            where: { id: quizId }
        });

        if (!quiz) return { error: "Quiz not found" };
        if (quiz.teacherId !== session.user.id) return { error: "Unauthorized" };

        // Soft delete
        await db.quiz.update({
            where: { id: quizId },
            data: { deletedAt: new Date() }
        })

        revalidatePath("/teacher/quiz-manager")
        return { success: true }

    } catch (error) {
        console.error("Error deleting quiz:", error)
        return { error: "Failed to delete quiz" }
    }
}

export async function restoreQuiz(quizId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const quiz = await db.quiz.findUnique({
            where: { id: quizId }
        });

        if (!quiz) return { error: "Quiz not found" };
        if (quiz.teacherId !== session.user.id) return { error: "Unauthorized" };

        // Restore
        await db.quiz.update({
            where: { id: quizId },
            data: { deletedAt: null }
        })

        revalidatePath("/teacher/quiz-manager")
        return { success: true }

    } catch (error) {
        console.error("Error restoring quiz:", error)
        return { error: "Failed to restore quiz" }
    }
}

// --- Question Actions ---

interface ChoiceInput {
    id?: string; // If present, update; else create
    text: string;
    imageUrl?: string;
    isCorrect: boolean;
    order: number;
}

interface QuestionInput {
    id?: string; // If present, update; else create
    text: string;
    imageUrl?: string;
    audioUrl?: string; // [NEW] Added audioUrl
    audioLimit?: number; // [NEW] Added audioLimit
    order: number;
    points?: number;
    gradingType?: 'ALL_OR_NOTHING' | 'RIGHT_MINUS_WRONG';
    explanation?: string | null;
    choices: ChoiceInput[];
}

export async function upsertQuestion(quizId: string, data: QuestionInput) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const quiz = await db.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) return { error: "Quiz not found" };
        if (quiz.teacherId !== session.user.id) return { error: "Unauthorized" };

        // Transactional update/create for question and its choices
        // For simplicity, if it's an update, we can delete existing choices and recreate them to handle reordering/deletion easily
        // Or strictly upsert choices. Recreating choices is safer for "state sync".

        if (data.id) {
            // Update existing question
            // 1. Update question fields
            // 2. Delete all existing choices (simplest way to handle removed choices)
            // 3. Create new choices
            // NOTE: This changes choice IDs, which might be bad if we track stats per choice later.
            // But for now, for a quiz editor, it's fine.

            // HOWEVER, if we want to be smarter:
            // separate choices into "to create", "to update", "to delete"
            // But let's stick to the "Delete all choices and recreate" strategy for MVP reliability unless `id` is provided for choices.

            // Actually, if choice has ID, we update. If not, create. 
            // What about deleted choices? Input `choices` is the *complete* list. Any existing choice NOT in this list should be deleted.

            return await db.$transaction(async (tx) => {
                // 1. Update Question
                const question = await tx.quizQuestion.update({
                    where: { id: data.id },
                    data: {
                        text: data.text,
                        imageUrl: data.imageUrl,
                        audioUrl: data.audioUrl,
                        audioLimit: data.audioLimit ?? 0,
                        order: data.order,
                        points: data.points ?? 1,
                        gradingType: data.gradingType ?? 'ALL_OR_NOTHING',
                        explanation: data.explanation
                    }
                });

                // 2. Handle Choices
                // Get existing choice IDs
                const existingChoices = await tx.quizChoice.findMany({
                    where: { questionId: data.id },
                    select: { id: true }
                });
                const existingIds = existingChoices.map(c => c.id);
                const incomingIds = data.choices.filter(c => c.id).map(c => c.id);

                // Delete choices not in incoming list
                const toDelete = existingIds.filter(id => !incomingIds.includes(id));
                if (toDelete.length > 0) {
                    await tx.quizChoice.deleteMany({
                        where: { id: { in: toDelete } }
                    });
                }

                // Upsert choices
                for (let i = 0; i < data.choices.length; i++) {
                    const choice = data.choices[i];
                    if (choice.id) {
                        await tx.quizChoice.update({
                            where: { id: choice.id },
                            data: {
                                text: choice.text,
                                imageUrl: choice.imageUrl,
                                isCorrect: choice.isCorrect,
                                order: i // Ensure order matches array order
                            }
                        })
                    } else {
                        await tx.quizChoice.create({
                            data: {
                                questionId: data.id!,
                                text: choice.text,
                                imageUrl: choice.imageUrl,
                                isCorrect: choice.isCorrect,
                                order: i
                            }
                        })
                    }
                }

                return { question };
            });

        } else {
            // Create New Question
            const question = await db.quizQuestion.create({
                data: {
                    quizId,
                    text: data.text,
                    imageUrl: data.imageUrl,
                    audioUrl: data.audioUrl,
                    audioLimit: data.audioLimit ?? 0,
                    order: data.order,
                    points: data.points ?? 1,
                    gradingType: data.gradingType ?? 'ALL_OR_NOTHING',
                    explanation: data.explanation,
                    choices: {
                        create: data.choices.map((c, index) => ({
                            text: c.text,
                            imageUrl: c.imageUrl,
                            isCorrect: c.isCorrect,
                            order: index
                        }))
                    }
                },
                include: { choices: true }
            })

            revalidatePath(`/teacher/quiz-manager/${quizId}`)
            return { question }
        }

    } catch (error) {
        console.error("Error upserting question:", error)
        return { error: "Failed to save question" }
    }
}

export async function deleteQuestion(questionId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const question = await db.quizQuestion.findUnique({
            where: { id: questionId },
            include: {
                quiz: true,
                choices: true // Need choices to delete their images
            }
        });

        if (!question) return { error: "Question not found" };
        if (question.quiz.teacherId !== session.user.id) return { error: "Unauthorized" };

        // Collect all images to delete
        const imagesToDelete: string[] = [];
        if (question.imageUrl) imagesToDelete.push(question.imageUrl);
        if (question.audioUrl) imagesToDelete.push(question.audioUrl);
        question.choices.forEach(c => {
            if (c.imageUrl) imagesToDelete.push(c.imageUrl);
        });

        if (imagesToDelete.length > 0) {
            await deleteQuizImages(imagesToDelete);
        }

        await db.quizQuestion.delete({
            where: { id: questionId }
        })

        revalidatePath(`/teacher/quiz-manager/${question.quizId}`)
        return { success: true }

    } catch (error) {
        console.error("Error deleting question:", error)
        return { error: "Failed to delete question" }
    }
}

// Bulk Import Helper
export async function bulkCreateQuestions(quizId: string, questionsData: QuestionInput[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const quiz = await db.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) return { error: "Quiz not found" };
        if (quiz.teacherId !== session.user.id) return { error: "Unauthorized" };

        // For bulk import, we just create everything.
        // We assume the parsing logic handles validation.

        await db.$transaction(async (tx) => {
            // Find max order to append
            const lastQuestion = await tx.quizQuestion.findFirst({
                where: { quizId: quizId },
                orderBy: { order: 'desc' }
            });
            let startOrder = (lastQuestion?.order ?? -1) + 1;

            for (const q of questionsData) {
                await tx.quizQuestion.create({
                    data: {
                        quizId,
                        text: q.text,
                        imageUrl: q.imageUrl,
                        audioUrl: q.audioUrl,
                        audioLimit: q.audioLimit ?? 0,
                        order: startOrder++,
                        points: q.points ?? 1,
                        gradingType: q.gradingType ?? 'ALL_OR_NOTHING',
                        explanation: q.explanation,
                        choices: {
                            create: q.choices.map((c, idx) => ({
                                text: c.text,
                                imageUrl: c.imageUrl,
                                isCorrect: c.isCorrect,
                                order: idx
                            }))
                        }
                    }
                })
            }
        })

        revalidatePath(`/teacher/quiz-manager/${quizId}`)
        return { success: true }

    } catch (error) {
        console.error("Error bulk creating questions:", error)
        return { error: "Failed to import questions" }
    }
}

export async function deleteQuizImages(urls: string[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        for (const url of urls) {
            if (!url) continue;

            // Check if it is a local file
            if (url.startsWith("/api/files/")) {
                // Local file deletion logic
                try {
                    // Expected format: /api/files/quiz-pictures/filename
                    const relativePath = url.replace("/api/files/", "");

                    // Sanitize check
                    if (relativePath.includes("..")) {
                        console.warn(`Skipping deletion of potential path traversal: ${relativePath}`);
                        continue;
                    }

                    const filePath = path.join(process.cwd(), "uploads", relativePath);
                    if (relativePath.startsWith("quiz-pictures/") || relativePath.startsWith("quiz-audio/")) {
                        await unlink(filePath).catch(() => { }); // Ignore not found
                    }
                } catch (err) {
                    console.error(`Failed to delete local file ${url}:`, err);
                }
            } else {
                // Remote file (UploadThing)
                // We currently do not delete remote files server-side to avoid auth complexity or blocking.
                // They will persist in UT.
            }
        }
        return { success: true }
    } catch (error) {
        console.error("Error deleting images:", error);
        return { error: "Failed to delete images" }
    }
}

export async function getStudentQuiz(quizId: string, assignmentId?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        // 1. Check Submission Status if assignmentId provided
        // 1. Check Submission Status
        let isSubmitted = false
        if (assignmentId) {
            const submission = await db.submission.findFirst({
                where: {
                    assignmentId,
                    studentId: session.user.id
                }
            })
            if (submission) isSubmitted = true
        } else {
            // Check for direct quiz submission by finding related assignment
            const assignment = await db.assignment.findFirst({
                where: { quizId: quizId }
            });
            if (assignment) {
                const submission = await db.submission.findFirst({
                    where: {
                        assignmentId: assignment.id,
                        studentId: session.user.id
                    }
                })
                if (submission) isSubmitted = true
            }
        }

        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        choices: {
                            orderBy: { order: 'asc' }
                            // Fetch all to compute flags, filter later
                        }
                    }
                }
            }
        })

        if (!quiz) return { error: "Quiz not found" }

        const questions = quiz.questions.map(q => {
            const correctCount = q.choices.filter(c => c.isCorrect).length
            const allowMultiple = correctCount > 1 || q.gradingType === 'RIGHT_MINUS_WRONG'

            let choices = [...q.choices]
            // Randomize only if NOT reviewing (or preserve order if reviewing? usually preserve original order is hard if we didn't save seed. 
            // If we randomize, explanation might be confusing if it refers to "Option A". 
            // For now, let's randomize if configured, even in review. 
            // Ideally we store the randomized order in submission, but strictly for MVP:
            // If isSubmitted, maybe we shouldn't randomize to avoid confusion? 
            // But if we didn't store the order, showing "sorted" choices might mismap with user memory.
            // Let's stick to randomizing if enabled. 
            // NOTE: If user refreshes, order changes. This is acceptable for simple quiz.

            if (quiz.randomizeChoices) {
                for (let i = choices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [choices[i], choices[j]] = [choices[j], choices[i]];
                }
            }

            const sanitizedChoices = choices.map(c => ({
                id: c.id,
                text: c.text,
                imageUrl: c.imageUrl,
                order: c.order,
                // Reveal isCorrect ONLY if submitted
                isCorrect: isSubmitted ? c.isCorrect : undefined
            }))

            return {
                id: q.id,
                text: q.text,
                imageUrl: q.imageUrl,
                audioUrl: q.audioUrl,
                audioLimit: q.audioLimit,
                order: q.order,
                points: q.points,
                gradingType: q.gradingType,
                allowMultiple,
                // Reveal explanation ONLY if submitted
                explanation: isSubmitted ? q.explanation : undefined,
                choices: sanitizedChoices
            }
        })

        return {
            quiz: {
                ...quiz,
                questions
            },
            isSubmitted // Helpful to pass back
        }
    } catch (error) {
        console.error("Error fetching student quiz:", error)
        return { error: "Failed to fetch quiz" }
    }
}
