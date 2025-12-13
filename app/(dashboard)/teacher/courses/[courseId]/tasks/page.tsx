import { getCourseAssignments } from "@/lib/actions/teacher.actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Calendar, FileText, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function CourseTasksPage({ params }: { params: { courseId: string } }) {
    // Await params before using (Next.js 15 requirement, good practice generally if generic)
    const { courseId } = await params
    const { assignments, error } = await getCourseAssignments(courseId)

    if (error || !assignments) {
        return (
            <div className="p-6">
                <div className="text-red-500">Error loading tasks: {error}</div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tasks</h1>
                    <p className="text-muted-foreground">Manage all assignments and quizzes for this course.</p>
                </div>
                <Link href={`/teacher/courses/${courseId}/tasks/new`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Task
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed">
                        No tasks created yet. Click "Create Task" to get started.
                    </div>
                ) : (
                    assignments.map((assignment) => (
                        <Link
                            key={assignment.id}
                            href={`/teacher/courses/${courseId}/tasks/${assignment.id}`}
                            className="block group"
                        >
                            <Card className="h-full hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="mb-2">
                                                {assignment.type === 'QUIZ' ? 'Quiz' : 'Assignment'}
                                            </Badge>
                                            <CardTitle className="text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {assignment.title}
                                            </CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Due {assignment.dueDate ? format(new Date(assignment.dueDate), "MMM d, yyyy") : "No due date"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>{assignment.maxPoints} pts</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
