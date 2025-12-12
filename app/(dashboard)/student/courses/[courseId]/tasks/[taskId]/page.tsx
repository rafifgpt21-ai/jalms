import { getAssignmentDetails } from "@/lib/actions/teacher.actions"
import { getUser } from "@/lib/actions/user.actions"
import { db as prisma } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { SubmissionForm } from "@/components/student/submission-form"
import { QuizPlayer } from "@/components/student/quiz/quiz-player"
import { CheckCircle, Clock, FileText, Calendar, Trophy, AlertTriangle } from "lucide-react"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default async function StudentTaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
    const { taskId } = await params
    const user = await getUser()
    if (!user) return <div>Unauthorized</div>

    const { assignment } = await getAssignmentDetails(taskId)
    if (!assignment) return <div>Assignment not found</div>

    const submission = await prisma.submission.findFirst({
        where: {
            assignmentId: taskId,
            studentId: user.id,
            deletedAt: { isSet: false }
        }
    })

    const isSubmitted = !!submission
    const isGraded = submission?.grade !== null && submission?.grade !== undefined
    const isLate = assignment.type !== 'NON_SUBMISSION' && assignment.dueDate && new Date() > new Date(assignment.dueDate) && !isSubmitted
    const wasLate = submission && assignment.dueDate && submission.submittedAt > assignment.dueDate

    // Status Logic
    let statusVariant = "outline"
    let statusLabel = "To Do"
    let statusColor = "text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800"

    if (isGraded) {
        statusVariant = "default"
        statusLabel = "Graded"
        statusColor = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30"
    } else if (isSubmitted) {
        statusVariant = "secondary"
        statusLabel = "Submitted"
        statusColor = "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30"
    } else if (isLate) {
        statusVariant = "destructive"
        statusLabel = "Missing"
        statusColor = "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30"
    }

    return (
        <div className="space-y-6" suppressHydrationWarning>
            <MobileHeaderSetter
                title={assignment.title}
                subtitle={assignment.course.name}
                backLink={`/student/courses/${assignment.courseId}/tasks`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Instructions & Work (Left 2 Cols) */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <span>{assignment.course.reportName || assignment.course.name}</span>
                            <span>•</span>
                            {/* @ts-ignore - teacher included in getAssignmentDetails via recent update */}
                            <span>{assignment.course.teacher?.name}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white leading-tight">
                            {assignment.title}
                        </h1>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
                        <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            Instructions
                        </h3>
                        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-indigo-600">
                            <div dangerouslySetInnerHTML={{ __html: assignment.description || "<p class='text-slate-500 italic'>No specific instructions provided.</p>" }} />
                        </div>
                    </div>

                    {/* Grade Feedback (if exists) */}
                    {(isGraded && (assignment.showGradeAfterSubmission || assignment.type !== 'QUIZ')) && (
                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 backdrop-blur-xl border border-emerald-100 dark:border-emerald-800 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-heading text-lg font-bold mb-1 flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                                        <CheckCircle className="w-5 h-5" />
                                        Feedback & Grade
                                    </h3>
                                    <p className="text-emerald-600 dark:text-emerald-500 text-sm">
                                        Great job! Here is your result.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-heading">
                                        {submission?.grade}
                                        <span className="text-lg text-emerald-400 dark:text-emerald-600 font-normal ml-1">/ {assignment.maxPoints}</span>
                                    </div>
                                </div>
                            </div>

                            {submission?.feedback && (
                                <div className="mt-4 p-4 bg-white/60 dark:bg-black/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-100">
                                    <p className="font-medium text-xs uppercase tracking-wider text-emerald-500 mb-1">Teacher Feedback</p>
                                    <p>{submission.feedback}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Work Area */}
                    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
                        <h3 className="font-heading text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">
                            Your Work
                        </h3>

                        {assignment.type === 'SUBMISSION' ? (
                            isGraded ? (
                                <div className="space-y-6">
                                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: submission?.submissionUrl || "" }} />
                                    </div>
                                    <p className="text-sm text-slate-500 text-center flex items-center justify-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Submitted on {format(new Date(submission!.submittedAt), "MMM d, h:mm a")}
                                    </p>

                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Edit Submission</h4>
                                        <SubmissionForm
                                            assignmentId={assignment.id}
                                            initialUrl={submission?.submissionUrl || ""}
                                            initialAttachmentUrl={submission?.attachmentUrl || ""}
                                            initialLink={submission?.link || ""}
                                            isLate={isLate || (!!wasLate)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <SubmissionForm
                                    assignmentId={assignment.id}
                                    initialUrl={submission?.submissionUrl || ""}
                                    initialAttachmentUrl={submission?.attachmentUrl || ""}
                                    initialLink={submission?.link || ""}
                                    isLate={isLate || (!!wasLate)}
                                />
                            )
                        ) : assignment.type === 'QUIZ' && assignment.quizId ? (
                            <QuizPlayer
                                quizId={assignment.quizId}
                                assignmentId={assignment.id}
                                initialAnswers={submission?.submissionUrl ? JSON.parse(submission.submissionUrl) : undefined}
                                isReadOnly={!!submission}
                                showGradeAfterSubmission={assignment.showGradeAfterSubmission}
                            />
                        ) : (
                            <div className="text-center py-10 text-slate-500">
                                <p>No submission required for this task.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Right Col) */}
                <div className="space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Task Details</h4>

                            <div className="space-y-4">
                                <div className={`flex items-center gap-3 p-3 rounded-xl ${statusColor}`}>
                                    {isGraded ? <CheckCircle className="w-5 h-5" /> :
                                        isSubmitted ? <CheckCircle className="w-5 h-5" /> :
                                            isLate ? <AlertTriangle className="w-5 h-5" /> :
                                                <Clock className="w-5 h-5" />}
                                    <span className="font-bold">{statusLabel}</span>
                                </div>

                                <div className="flex items-center justify-between p-2">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Due Date
                                    </span>
                                    <span className={`font-medium ${isLate ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                                        {assignment.dueDate ? format(new Date(assignment.dueDate), "MMM d") : "No Due Date"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 pt-0">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-6 text-xs">
                                        Time
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        {assignment.dueDate ? format(new Date(assignment.dueDate), "h:mm a") : "-"}
                                    </span>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                <div className="flex items-center justify-between p-2">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Trophy className="w-4 h-4" /> Points
                                    </span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {assignment.maxPoints} pts
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Extra Info Card */}
                        {(assignment.isExtraCredit || assignment.latePenalty > 0) && (
                            <div className="bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
                                {assignment.isExtraCredit && (
                                    <div className="flex items-center gap-2 text-emerald-600 mb-2 font-medium">
                                        <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">Extra Credit</Badge>
                                        <span className="text-sm">Available</span>
                                    </div>
                                )}
                                {assignment.latePenalty > 0 && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                        <span>Late Penalty:</span>
                                        <span className="font-bold">-{assignment.latePenalty}%</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
