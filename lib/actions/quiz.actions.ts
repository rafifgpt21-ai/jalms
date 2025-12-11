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

export async function createQuiz(title: string, description?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const quiz = await db.quiz.create({
            data: {
                title,
                description,
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

export async function updateQuiz(quizId: string, data: { title?: string, description?: string }) {
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
            where: { id: quizId },
            include: {
                questions: {
                    include: { choices: true }
                }
            }
        });

        if (!quiz) return { error: "Quiz not found" };
        if (quiz.teacherId !== session.user.id) return { error: "Unauthorized" };

        // Collect all images to delete from questions and choices
        const imagesToDelete: string[] = [];
        quiz.questions.forEach(q => {
            if (q.imageUrl) imagesToDelete.push(q.imageUrl);
            q.choices.forEach(c => {
                if (c.imageUrl) imagesToDelete.push(c.imageUrl);
            });
        });

        if (imagesToDelete.length > 0) {
            await deleteQuizImages(imagesToDelete);
        }

        // Decouple assignments and delete quiz
        await db.$transaction([
            db.assignment.updateMany({
                where: { quizId: quizId },
                data: { quizId: null } // Or handle as needed, but safely decoupling is best
            }),
            db.quiz.delete({
                where: { id: quizId }
            })
        ]);

        revalidatePath("/teacher/quiz-manager")
        return { success: true }

    } catch (error) {
        console.error("Error deleting quiz:", error)
        return { error: "Failed to delete quiz" }
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
    order: number;
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
                        order: data.order,
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
                                questionId: data.id,
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
                    order: data.order,
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
                        order: startOrder++,
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

            // Expected format: /api/files/quiz-pictures/filename
            // or just filename if relative? The DB stores URL.

            // Basic validation to prevent deleting outside uploads
            if (!url.includes("/api/files/quiz-pictures/")) {
                console.warn(`Skipping deletion of invalid image path: ${url}`);
                continue;
            }

            const relativePath = url.replace("/api/files/", "");
            // Sanitize check
            if (relativePath.includes("..")) {
                console.warn(`Skipping deletion of potential path traversal: ${relativePath}`);
                continue;
            }

            const filePath = path.join(process.cwd(), "uploads", relativePath);

            try {
                await unlink(filePath);
                console.log(`Deleted file: ${filePath}`);
            } catch (err) {
                console.error(`Failed to delete file ${filePath}:`, err);
                // Continue to next file even if one fails
            }
        }
        return { success: true }
    } catch (error) {
        console.error("Error deleting images:", error);
        return { error: "Failed to delete images" }
    }
}

export async function getStudentQuiz(quizId: string) {
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
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                text: true,
                                imageUrl: true,
                                order: true
                                // Omit isCorrect
                            }
                        }
                    }
                }
            }
        })

        if (!quiz) return { error: "Quiz not found" }
        // We don't strictly check teacherId here because students need to access it.
        // We might want to check if the user is enrolled in a course that has an assignment using this quiz,
        // but for now, simple access for logged-in users is acceptable (or if needed, add enrollment check).

        return { quiz }
    } catch (error) {
        console.error("Error fetching student quiz:", error)
        return { error: "Failed to fetch quiz" }
    }
}
