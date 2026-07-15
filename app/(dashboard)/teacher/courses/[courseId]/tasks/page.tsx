import { getCourseAssignments } from "@/lib/actions/teacher.actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarClock, ClipboardCheck, FileText, Plus } from "lucide-react"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import {
    WorkspacePage,
    WorkspacePanel,
} from "@/components/workspace/workspace-page"
import { TaskManagementList } from "@/components/teacher/tasks/task-management-list"

export default async function CourseTasksPage({ params }: { params: { courseId: string } }) {
    // Await params before using (Next.js 15 requirement, good practice generally if generic)
    const { courseId } = await params
    const { assignments, error } = await getCourseAssignments(courseId)

    if (error || !assignments) {
        return <WorkspacePanel className="p-4 text-sm text-destructive">Error loading tasks: {error}</WorkspacePanel>
    }

    const now = new Date()
    const upcomingCutoff = new Date(now)
    upcomingCutoff.setDate(upcomingCutoff.getDate() + 7)
    const activeAssignments = assignments.filter((assignment) => assignment.status !== "ARCHIVED")
    const dueSoon = activeAssignments.filter((assignment) => {
        const dueDate = new Date(assignment.dueDate)
        return dueDate >= now && dueDate <= upcomingCutoff
    }).length
    const overdue = activeAssignments.filter((assignment) => new Date(assignment.dueDate) < now).length

    return (
        <WorkspacePage>
            <MobileHeaderSetter title="Tasks" subtitle="Create and manage course assignments." />

            <WorkspacePanel className="grid grid-cols-3 overflow-hidden sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
                {[
                    { icon: FileText, value: assignments.length, label: "All tasks" },
                    { icon: CalendarClock, value: dueSoon, label: "Due in 7 days" },
                    { icon: ClipboardCheck, value: overdue, label: "Past due" },
                ].map(({ icon: Icon, value, label }, index) => (
                    <div key={label} className={`flex min-w-0 items-center gap-2 px-3 py-2.5 sm:gap-3 ${index < 2 ? "border-r" : "sm:border-r"}`}>
                        <Icon className="hidden size-4 shrink-0 text-primary min-[430px]:block" />
                        <div className="min-w-0">
                            <div className="font-semibold tabular-nums">{value}</div>
                            <div className="truncate text-[11px] text-muted-foreground sm:text-xs">{label}</div>
                        </div>
                    </div>
                ))}
                <div className="col-span-3 flex gap-2 border-t p-2 sm:col-span-1 sm:items-center sm:border-t-0 sm:px-3">
                    <Button asChild className="min-w-0 flex-1 sm:w-auto sm:flex-none">
                        <Link href={`/teacher/courses/${courseId}/tasks/new`}>
                            <Plus className="size-4" />
                            Create Task
                        </Link>
                    </Button>
                </div>
            </WorkspacePanel>

            <TaskManagementList assignments={assignments} courseId={courseId} />
        </WorkspacePage>
    )
}
