import { getAssignmentDetails } from "@/lib/actions/teacher.actions"
import { getUser } from "@/lib/actions/user.actions"
import { db as prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { SubmissionForm } from "@/components/student/submission-form"
import { CheckCircle, AlertCircle, Clock, FileText } from "lucide-react"

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

    // If submitted, check if it was late
    const wasLate = submission && assignment.dueDate && submission.submittedAt > assignment.dueDate

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{assignment.title}</h1>
                    <div className="text-gray-500 mt-1">{assignment.course.name}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {assignment.type !== 'NON_SUBMISSION' && (
                        <div className="text-sm font-medium">
                            Due: {format(new Date(assignment.dueDate), "MMM d, h:mm a")}
                        </div>
                    )}
                    <Badge variant={
                        isGraded ? 'default' :
                            isSubmitted ? 'secondary' :
                                isLate ? 'destructive' : 'outline'
                    } className={
                        isGraded ? 'bg-green-600' :
                            isSubmitted ? 'bg-blue-600 text-white' : ''
                    }>
                        {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : isLate ? 'Missing' : 'To Do'}
                    </Badge>
                </div>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                            <p>{assignment.description || "No instructions provided."}</p>
                        </div>
                    </CardContent>
                </Card>

                {isGraded && (
                    <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-5 w-5" />
                                Feedback & Grade
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-medium">Score:</span>
                                <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    {submission?.grade} / {assignment.maxPoints}
                                </span>
                            </div>
                            {submission?.feedback && (
                                <div className="bg-white dark:bg-black p-4 rounded-md border">
                                    <p className="font-medium mb-1 text-sm text-gray-500">Teacher Feedback:</p>
                                    <p>{submission.feedback}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Your Work</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assignment.type === 'SUBMISSION' ? (
                            isGraded ? (
                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: submission?.submissionUrl || "" }} />
                                        </div>
                                        <p className="text-xs text-gray-500 text-center">
                                            Submitted on {format(new Date(submission!.submittedAt), "MMM d, h:mm a")}
                                        </p>
                                        <div className="pt-4 border-t">
                                            <h4 className="text-sm font-medium mb-2">Edit Submission</h4>
                                            <SubmissionForm
                                                assignmentId={assignment.id}
                                                initialUrl={submission?.submissionUrl || ""}
                                                initialAttachmentUrl={submission?.attachmentUrl || ""}
                                                initialLink={submission?.link || ""}
                                                isLate={isLate || (!!wasLate)}
                                            />
                                        </div>
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
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <p>No submission required for this task.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Points Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Max Points:</span>
                            <span>{assignment.maxPoints}</span>
                        </div>
                        {assignment.isExtraCredit && (
                            <div className="flex justify-between text-green-600">
                                <span>Extra Credit:</span>
                                <span>Yes</span>
                            </div>
                        )}
                        {assignment.latePenalty > 0 && (
                            <div className="flex justify-between text-red-600">
                                <span>Late Penalty:</span>
                                <span>-{assignment.latePenalty}%</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
