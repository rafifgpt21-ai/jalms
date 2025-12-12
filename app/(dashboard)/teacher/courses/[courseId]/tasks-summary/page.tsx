import { getCourseTaskSummary } from "@/lib/actions/teacher.actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock, AlertCircle, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default async function TasksSummaryPage({
    params
}: {
    params: Promise<{ courseId: string }>
}) {
    const { courseId } = await params

    const response = await getCourseTaskSummary(courseId)

    if ('error' in response) {
        return (
            <div className="p-6">
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                    Error: {response.error}
                </div>
            </div>
        )
    }

    const { data: students, assignments, courseName } = response

    const getStatusIcon = (status: "MISSING" | "SUBMITTED" | "GRADED" | "PENDING", grade: number | null) => {
        switch (status) {
            case "GRADED":
                return (
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-green-500 font-bold">{grade}</div>
                    </div>
                )
            case "SUBMITTED":
                return (
                    <div className="flex justify-center">
                        <FileCheck className="h-5 w-5 text-blue-500" />
                    </div>
                )
            case "MISSING":
                return (
                    <div className="flex justify-center">
                        <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                )
            case "PENDING":
                return (
                    <div className="flex justify-center">
                        <Clock className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            <MobileHeaderSetter
                title="Task Summary"
                subtitle={courseName}
                backLink="/teacher"
            />
            <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle>Student Progress</CardTitle>
                </CardHeader>
                <CardContent className="overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="w-[200px] min-w-[200px] sticky left-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-white/10">Student</TableHead>
                                {assignments?.map((assignment) => (
                                    <TableHead key={assignment.id} className="text-center min-w-[100px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="whitespace-nowrap font-medium max-w-[150px] truncate" title={assignment.title}>
                                                {assignment.title}
                                            </span>
                                            {assignment.dueDate && (
                                                <span className="text-[10px] text-muted-foreground font-normal">
                                                    {new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students?.map((student) => (
                                <TableRow key={student.studentId} className="hover:bg-white/30 dark:hover:bg-white/5 border-b border-light-white/10 transition-colors">
                                    <TableCell className="font-medium sticky left-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-white/10 group-hover:bg-white/60 dark:group-hover:bg-slate-800/60 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={student.studentAvatar || undefined} />
                                                <AvatarFallback>{student.studentName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="truncate max-w-[150px]" title={student.studentName}>{student.studentName}</span>
                                        </div>
                                    </TableCell>
                                    {student.tasks.map((task) => (
                                        <TableCell key={task.assignmentId} className="text-center p-2">
                                            {getStatusIcon(task.status, task.grade)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
