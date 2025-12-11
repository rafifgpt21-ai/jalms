import { getCourseAssignments } from "@/lib/actions/teacher.actions"
import { getUser } from "@/lib/actions/user.actions"
import { db as prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { CheckCircle, Clock, AlertCircle, FileText } from "lucide-react"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default async function StudentCourseTasksPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const user = await getUser()
    if (!user) return <div>Unauthorized</div>

    const { assignments } = await getCourseAssignments(courseId)

    // We need to fetch submissions to know the status
    // getCourseAssignments only returns assignments.
    // Let's fetch submissions for this student separately or modify the action.
    // Or just fetch here directly for simplicity since we are in a server component.

    const studentSubmissions = await prisma.submission.findMany({
        where: {
            studentId: user.id,
            assignmentId: { in: assignments?.map(a => a.id) || [] },
            deletedAt: { isSet: false }
        }
    })

    const tasksWithStatus = assignments?.map(assignment => {
        const submission = studentSubmissions.find(s => s.assignmentId === assignment.id)
        const isSubmitted = !!submission
        const isLate = assignment.dueDate && new Date() > new Date(assignment.dueDate) && !isSubmitted
        const isGraded = submission?.grade !== null && submission?.grade !== undefined
        // Determine if we should show the grade
        const showGrade = assignment.type !== 'QUIZ' || assignment.showGradeAfterSubmission

        let status = "To Do"
        if (isGraded && showGrade) status = "Graded"
        else if (isSubmitted) status = "Submitted"
        else if (isLate) status = "Missing"

        return {
            ...assignment,
            submission,
            status
        }
    })

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Course Tasks" backLink="/student" />
            <h1 className="text-2xl font-bold">Course Tasks</h1>

            <div className="grid gap-4">
                {tasksWithStatus?.map((task) => (
                    <Link key={task.id} href={`/student/courses/${courseId}/tasks/${task.id}`}>
                        <Card className="hover:border-blue-500 transition-colors cursor-pointer">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${task.status === 'Graded' ? 'bg-green-100 text-green-600' :
                                        task.status === 'Submitted' ? 'bg-blue-100 text-blue-600' :
                                            task.status === 'Missing' ? 'bg-red-100 text-red-600' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {task.status === 'Graded' || task.status === 'Submitted' ? <CheckCircle className="h-5 w-5" /> :
                                            task.status === 'Missing' ? <AlertCircle className="h-5 w-5" /> :
                                                <FileText className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{task.title}</h3>
                                        <div className="text-sm text-gray-500 flex gap-2">
                                            <span>Due: {format(new Date(task.dueDate), "MMM d, h:mm a")}</span>
                                            <span>•</span>
                                            <span>{task.maxPoints} pts</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {task.status === 'Graded' && (
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">{task.submission?.grade} / {task.maxPoints}</div>
                                            <div className="text-xs text-gray-500">Score</div>
                                        </div>
                                    )}
                                    <Badge variant={
                                        task.status === 'Graded' ? 'default' :
                                            task.status === 'Submitted' ? 'secondary' :
                                                task.status === 'Missing' ? 'destructive' : 'outline'
                                    } className={
                                        task.status === 'Graded' ? 'bg-green-600' :
                                            task.status === 'Submitted' ? 'bg-blue-600 text-white' : ''
                                    }>
                                        {task.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {(!tasksWithStatus || tasksWithStatus.length === 0) && (
                    <p className="text-gray-500">No tasks assigned yet.</p>
                )}
            </div>
        </div>
    )
}
