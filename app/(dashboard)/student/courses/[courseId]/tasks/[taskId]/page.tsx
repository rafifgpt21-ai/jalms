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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" suppressHydrationWarning>
            <MobileHeaderSetter
                title={assignment.title}
                subtitle={assignment.course.name}
                backLink={`/student/courses/${assignment.courseId}/tasks`}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Main Content: Instructions & Work (Span 8) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Header Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800">
                                {assignment.course.reportName || assignment.course.name}
                            </Badge>
                            <span>•</span>
                            {/* @ts-ignore */}
                            <span>{assignment.course.teacher?.name}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                            {assignment.title}
                        </h1>
                    </div>

                    {/* Left Col Stack */}
                    <div className="space-y-6">

                        {/* Instructions Panel */}
                        <div className="group relative overflow-hidden rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                            <div className="p-8">
                                <h3 className="font-heading text-xl font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-slate-100">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    Instructions
                                </h3>
                                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-indigo-600 prose-img:rounded-xl">
                                    <div dangerouslySetInnerHTML={{ __html: assignment.description || "<p class='text-slate-500 italic'>No specific instructions provided.</p>" }} />
                                </div>
                            </div>
                        </div>

                        {/* Grade Feedback (if exists) */}
                        {(isGraded && (assignment.showGradeAfterSubmission || assignment.type !== 'QUIZ')) && (
                            <div className="rounded-3xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 p-8 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <h3 className="font-heading text-xl font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                                            <CheckCircle className="w-6 h-6" />
                                            Graded & Reviewed
                                        </h3>
                                        <p className="text-emerald-600 dark:text-emerald-500">
                                            Your work has been graded by the teacher.
                                        </p>
                                    </div>
                                    <div className="flex items-baseline gap-2 bg-white/50 dark:bg-black/20 px-6 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                        <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 font-heading tracking-tight">
                                            {submission?.grade}
                                        </span>
                                        <span className="text-lg text-emerald-500/70 font-medium">/ {assignment.maxPoints}</span>
                                    </div>
                                </div>

                                {submission?.feedback && (
                                    <div className="mt-6 p-6 bg-white/60 dark:bg-black/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-100">
                                        <p className="font-bold text-xs uppercase tracking-widest text-emerald-500 mb-3">Feedback</p>
                                        <p className="text-lg leading-relaxed">{submission.feedback}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Work Area */}
                        <div className="rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm p-8">
                            <h3 className="font-heading text-xl font-bold mb-6 text-slate-800 dark:text-slate-200">
                                Your Work
                            </h3>

                            {assignment.type === 'SUBMISSION' ? (
                                isGraded ? (
                                    <div className="space-y-6">
                                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/50">
                                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: submission?.submissionUrl || "" }} />
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 dark:bg-slate-900/30 py-3 rounded-xl">
                                            <Clock className="w-4 h-4" />
                                            Submitted on {format(new Date(submission!.submittedAt), "MMMM d, h:mm a")}
                                        </div>

                                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Resubmit Work</h4>
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
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <CheckCircle className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="font-medium">No submission required for this task.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Sidebar (Span 4) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24 space-y-6">

                        {/* Status Card */}
                        <div className="rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm p-6 space-y-6">

                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
                                {assignment.isExtraCredit && (
                                    <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">Extra Credit</Badge>
                                )}
                            </div>

                            <div className={`flex items-center justify-between p-4 rounded-2xl border ${statusVariant === 'default' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900' : statusVariant === 'destructive' ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-900' : isSubmitted ? 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-900' : 'bg-slate-50 border-slate-100 text-slate-700 dark:bg-slate-800/50 dark:border-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    {isGraded ? <CheckCircle className="w-5 h-5" /> :
                                        isSubmitted ? <CheckCircle className="w-5 h-5" /> :
                                            isLate ? <AlertTriangle className="w-5 h-5" /> :
                                                <Clock className="w-5 h-5" />}
                                    <span className="font-bold">{statusLabel}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                {assignment.type !== 'NON_SUBMISSION' && (
                                    <div className="flex items-start justify-between group">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold uppercase tracking-wider">Due Date</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${isLate ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                                                {assignment.dueDate ? format(new Date(assignment.dueDate), "MMM d, yyyy") : "No Due Date"}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {assignment.dueDate ? format(new Date(assignment.dueDate), "h:mm a") : ""}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {assignment.type !== 'NON_SUBMISSION' && (
                                    <div className="h-px bg-slate-100 dark:bg-slate-800" />
                                )}

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                            <Trophy className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wider">Points</span>
                                    </div>
                                    <span className="font-bold text-xl text-slate-900 dark:text-white font-heading">
                                        {assignment.maxPoints} pts
                                    </span>
                                </div>
                            </div>

                            {assignment.latePenalty > 0 && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                        A <span className="font-bold">{assignment.latePenalty}% penalty</span> applies to late submissions.
                                    </p>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
