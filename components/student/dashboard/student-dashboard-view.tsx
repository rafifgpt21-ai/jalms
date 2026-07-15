import Link from "next/link"
import { format, isPast, isToday } from "date-fns"
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, GraduationCap } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { WorkspacePanel } from "@/components/workspace/workspace-page"
import { getPeriodLabel } from "@/lib/helpers/period-label"

interface StudentScheduleItem {
  id: string
  courseId: string
  period: number
  topic: string | null
  course: { name: string; reportName?: string | null; teacher: { name: string }; subject?: { name: string; reportName?: string | null } | null }
}

interface StudentDeadlineItem {
  id: string
  courseId: string
  title: string
  dueDate: Date | string
  submissions: Array<{ id: string }>
  course: { name: string; reportName?: string | null; subject?: { name: string; reportName?: string | null } | null }
}

interface StudentGradeItem {
  grade: number | null
  assignment: { title: string }
}

function PanelHeading({ title, description, href, label = "View all" }: { title: string; description: string; href?: string; label?: string }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b px-4 py-2.5">
      <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{title}</h2><p className="truncate text-xs text-muted-foreground">{description}</p></div>
      {href && <Button asChild size="sm" variant="ghost"><Link href={href}>{label}<ArrowRight /></Link></Button>}
    </div>
  )
}

export function StudentUpNextCard({ schedule }: { schedule: StudentScheduleItem[] }) {
  const nextClass = schedule[0]
  const courseHref = nextClass ? `/student/courses/${nextClass.courseId}` : "/student/schedule"

  return (
    <WorkspacePanel className="overflow-hidden">
      <PanelHeading title="Up next" description={format(new Date(), "EEEE, MMMM d")} href="/student/schedule" label="Schedule" />
      <Link href={courseHref} className="group flex min-h-28 items-center gap-4 px-4 py-4 transition-colors hover:bg-[var(--workspace-row-hover)]">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><Clock3 className="size-5" /></span>
        {nextClass ? (
          <>
            <span className="min-w-0 flex-1"><span className="block text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{getPeriodLabel(nextClass.period)}</span><span className="mt-1 block truncate text-base font-semibold">{nextClass.course.subject?.reportName || nextClass.course.reportName || nextClass.course.name}</span><span className="block truncate text-xs text-muted-foreground">{nextClass.course.teacher.name}{nextClass.topic ? ` · ${nextClass.topic}` : ""}</span></span>
            <span className="hidden text-right sm:block"><span className="block text-sm font-semibold tabular-nums">{schedule.length}</span><span className="text-xs text-muted-foreground">classes today</span></span>
          </>
        ) : (
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">No classes scheduled today</span><span className="block text-xs text-muted-foreground">Review upcoming work or continue learning.</span></span>
        )}
        <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
      </Link>
    </WorkspacePanel>
  )
}

export function StudentScheduleCard({ schedule }: { schedule: StudentScheduleItem[] }) {
  return (
    <WorkspacePanel className="overflow-hidden">
      <PanelHeading title="Today’s schedule" description={`${schedule.length} class${schedule.length === 1 ? "" : "es"}`} href="/student/schedule" />
      {schedule.length ? <div className="divide-y">{schedule.map((slot) => (
        <Link key={slot.id} href={`/student/courses/${slot.courseId}`} className="group grid min-h-14 grid-cols-[4.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--workspace-row-hover)]">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">{getPeriodLabel(slot.period)}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-medium">{slot.course.subject?.reportName || slot.course.reportName || slot.course.name}</span><span className="block truncate text-xs text-muted-foreground">{slot.course.teacher.name}{slot.topic ? ` · ${slot.topic}` : ""}</span></span>
          <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground" />
        </Link>
      ))}</div> : <div className="px-4 py-8 text-center"><p className="text-sm font-medium">Your schedule is clear</p><p className="mt-1 text-xs text-muted-foreground">There are no classes today.</p></div>}
    </WorkspacePanel>
  )
}

export function StudentDeadlinesWidget({ upcomingDeadlines }: { upcomingDeadlines: StudentDeadlineItem[] }) {
  return (
    <WorkspacePanel className="overflow-hidden">
      <PanelHeading title="Deadlines" description="Work that needs attention" href="/student/courses" label="Courses" />
      {upcomingDeadlines.length ? <div className="divide-y">{upcomingDeadlines.map((assignment) => {
        const submitted = assignment.submissions.length > 0
        const overdue = !submitted && isPast(new Date(assignment.dueDate))
        return (
          <Link key={assignment.id} href={`/student/courses/${assignment.courseId}/tasks/${assignment.id}`} className="group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--workspace-row-hover)]">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">{submitted ? <CheckCircle2 className="size-4 text-emerald-600" /> : <BookOpen className="size-4" />}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{assignment.title}</span><span className="block truncate text-xs text-muted-foreground">{assignment.course.subject?.reportName || assignment.course.reportName || assignment.course.name} · {format(new Date(assignment.dueDate), "MMM d, h:mm a")}</span></span>
            <StatusBadge status={submitted ? "SUBMITTED" : overdue ? "OVERDUE" : isToday(new Date(assignment.dueDate)) ? "PENDING" : "TODO"} label={submitted ? "Submitted" : overdue ? "Overdue" : isToday(new Date(assignment.dueDate)) ? "Due today" : "To do"} />
          </Link>
        )
      })}</div> : <div className="px-4 py-8 text-center"><p className="text-sm font-medium">No upcoming deadlines</p><p className="mt-1 text-xs text-muted-foreground">You’re caught up for now.</p></div>}
    </WorkspacePanel>
  )
}

export function StudentGradesWidget({ recentGrades, deadlinesCount }: { recentGrades: StudentGradeItem[]; deadlinesCount: number }) {
  const latestGrade = recentGrades[0]
  return (
    <WorkspacePanel className="grid overflow-hidden sm:grid-cols-2">
      <Link href="/student/courses" className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--workspace-row-hover)]">
        <span className="flex size-9 items-center justify-center rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300"><CalendarDays className="size-4" /></span>
        <span className="min-w-0"><span className="flex items-baseline gap-2"><span className="text-xl font-semibold tabular-nums">{deadlinesCount}</span><span className="text-xs font-medium">Open deadlines</span></span><span className="block truncate text-xs text-muted-foreground">Submitted and pending work</span></span>
      </Link>
      <Link href="/student/grades" className="flex min-h-16 items-center gap-3 border-t px-4 py-3 transition-colors hover:bg-[var(--workspace-row-hover)] sm:border-l sm:border-t-0">
        <span className="flex size-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><GraduationCap className="size-4" /></span>
        <span className="min-w-0"><span className="flex items-baseline gap-2"><span className="text-xl font-semibold tabular-nums">{latestGrade?.grade != null ? `${Math.round(latestGrade.grade)}%` : "—"}</span><span className="text-xs font-medium">Latest grade</span></span><span className="block truncate text-xs text-muted-foreground">{latestGrade ? latestGrade.assignment.title : "No graded work yet"}</span></span>
      </Link>
    </WorkspacePanel>
  )
}
