import { cache } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  Settings2,
  Sparkles,
  Users,
} from "lucide-react"
import { format, isToday } from "date-fns"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { getPeriodLabel } from "@/lib/helpers/period-label"
import { Button } from "@/components/ui/button"
import { WorkspaceHeader, WorkspacePage, WorkspacePanel } from "@/components/workspace/workspace-page"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const DAY_IN_MS = 24 * 60 * 60 * 1000

const getHomeData = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, nickname: true, roles: true },
  })
  if (!user) return null

  const userId = session.user.id
  const isTeacher = user.roles.includes("SUBJECT_TEACHER")
  const isStudent = user.roles.includes("STUDENT")
  const isAdmin = user.roles.includes("ADMIN")
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(startOfToday.getTime() + DAY_IN_MS)
  const nextWeek = new Date(now.getTime() + 7 * DAY_IN_MS)

  const studentCourseWhere = {
    OR: [
      { studentIds: { has: userId } },
      { courseEnrollments: { some: { studentId: userId, OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] } } },
    ],
    term: { isActive: true },
    deletedAt: { isSet: false },
  }

  const [
    teachingCount,
    learningCount,
    teachingSchedule,
    learningSchedule,
    teacherUpcoming,
    ungradedCount,
    studentAssignments,
    recentGrades,
    adminStats,
  ] = await Promise.all([
    isTeacher ? db.course.count({ where: { teacherId: userId, term: { isActive: true }, deletedAt: { isSet: false } } }) : 0,
    isStudent ? db.course.count({ where: studentCourseWhere }) : 0,
    isTeacher
      ? db.schedule.findMany({
          where: {
            dayOfWeek: now.getDay(),
            deletedAt: { isSet: false },
            course: { teacherId: userId, term: { isActive: true }, deletedAt: { isSet: false } },
          },
          include: { course: { include: { subject: true, class: true, _count: { select: { students: true } } } } },
          orderBy: { period: "asc" },
        })
      : [],
    isStudent
      ? db.schedule.findMany({
          where: { dayOfWeek: now.getDay(), deletedAt: { isSet: false }, course: studentCourseWhere },
          include: { course: { include: { subject: true, class: true, teacher: true } } },
          orderBy: { period: "asc" },
        })
      : [],
    isTeacher
      ? db.assignment.findMany({
          where: {
            course: { teacherId: userId, term: { isActive: true }, deletedAt: { isSet: false } },
            deletedAt: { isSet: false },
            dueDate: { gte: now, lte: nextWeek },
          },
          include: {
            course: { select: { id: true, name: true, subject: true } },
            submissions: { where: { grade: null, deletedAt: { isSet: false } }, select: { id: true } },
          },
          orderBy: { dueDate: "asc" },
          take: 4,
        })
      : [],
    isTeacher
      ? db.submission.count({
          where: {
            grade: null,
            deletedAt: { isSet: false },
            assignment: {
              deletedAt: { isSet: false },
              course: { teacherId: userId, term: { isActive: true }, deletedAt: { isSet: false } },
            },
          },
        })
      : 0,
    isStudent
      ? db.assignment.findMany({
          where: {
            course: studentCourseWhere,
            deletedAt: { isSet: false },
            type: { in: ["SUBMISSION", "QUIZ"] },
            dueDate: { lte: nextWeek },
          },
          include: {
            course: { select: { id: true, name: true, subject: true } },
            submissions: { where: { studentId: userId, deletedAt: { isSet: false } }, select: { id: true } },
          },
          orderBy: { dueDate: "asc" },
          take: 12,
        })
      : [],
    isStudent
      ? db.submission.findMany({
          where: { studentId: userId, grade: { not: null }, deletedAt: { isSet: false } },
          include: { assignment: { include: { course: { include: { subject: true } } } } },
          orderBy: { submittedAt: "desc" },
          take: 3,
        })
      : [],
    isAdmin
      ? Promise.all([
          db.user.count({ where: { isActive: true, deletedAt: { isSet: false } } }),
          db.class.count({ where: { term: { isActive: true }, deletedAt: { isSet: false } } }),
          db.course.count({ where: { term: { isActive: true }, deletedAt: { isSet: false } } }),
        ]).then(([users, classes, courses]) => ({ users, classes, courses }))
      : null,
  ])

  const scheduleCourseIds = [...teachingSchedule, ...learningSchedule].map((item) => item.courseId)
  const attendance = scheduleCourseIds.length
    ? await db.attendance.findMany({
        where: {
          courseId: { in: scheduleCourseIds },
          date: { gte: startOfToday, lt: endOfToday },
          deletedAt: { isSet: false },
        },
        select: { courseId: true, period: true, status: true, topic: true },
      })
    : []

  const attendanceFor = (courseId: string, period: number) =>
    attendance.filter((item) => item.courseId === courseId && item.period === period)

  const today = [
    ...teachingSchedule.map((item) => {
      const records = attendanceFor(item.courseId, item.period)
      return {
        id: `teacher-${item.id}`,
        courseId: item.courseId,
        courseName: item.course.name,
        subjectName: item.course.subject?.name ?? "Course",
        className: item.course.class?.name ?? `${item.course._count.students} students`,
        period: item.period,
        perspective: "Teaching" as const,
        topic: records.find((record) => record.topic)?.topic ?? null,
        done: records.length > 0,
        skipped: records.some((record) => record.status === "SKIPPED"),
        href: `/teacher/courses/${item.courseId}/attendance/session?date=${format(now, "yyyy-MM-dd")}&period=${item.period}`,
      }
    }),
    ...learningSchedule.map((item) => {
      const records = attendanceFor(item.courseId, item.period)
      return {
        id: `student-${item.id}`,
        courseId: item.courseId,
        courseName: item.course.name,
        subjectName: item.course.subject?.name ?? "Course",
        className: item.course.teacher.name,
        period: item.period,
        perspective: "Learning" as const,
        topic: records.find((record) => record.topic)?.topic ?? null,
        done: false,
        skipped: records.some((record) => record.status === "SKIPPED"),
        href: `/student/courses/${item.courseId}`,
      }
    }),
  ]
    .filter((item) => !item.skipped)
    .sort((a, b) => a.period - b.period)

  const unfinishedStudentAssignments = studentAssignments.filter((assignment) => assignment.submissions.length === 0).slice(0, 4)
  const pendingAttendance = teachingSchedule.filter((item) => attendanceFor(item.courseId, item.period).length === 0).length

  return {
    name: user.nickname || user.name.split(" ")[0],
    roles: user.roles,
    now,
    today,
    teachingCount,
    learningCount,
    pendingAttendance,
    ungradedCount,
    teacherUpcoming,
    studentAssignments: unfinishedStudentAssignments,
    recentGrades,
    adminStats,
  }
})

type HomeData = NonNullable<Awaited<ReturnType<typeof getHomeData>>>

function SectionHeading({ icon: Icon, title, description, href, linkLabel }: {
  icon: typeof CalendarDays
  title: string
  description: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b px-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
          {linkLabel ?? "View all"}<ChevronRight className="size-3.5" />
        </Link>
      )}
    </div>
  )
}

function MetricStrip({ data }: { data: HomeData }) {
  const attentionCount = data.pendingAttendance + data.ungradedCount + data.studentAssignments.length
  const activeSpaces = data.teachingCount + data.learningCount

  const metrics = [
    { label: "Classes today", value: data.today.length, detail: data.today.length ? `${data.today.filter((item) => item.perspective === "Teaching").length} teaching · ${data.today.filter((item) => item.perspective === "Learning").length} learning` : "Your day is clear", icon: CalendarDays },
    { label: "Needs attention", value: attentionCount, detail: attentionCount ? "Open items across your roles" : "You’re all caught up", icon: CircleAlert },
    { label: "Active courses", value: activeSpaces, detail: `${data.teachingCount} teaching · ${data.learningCount} enrolled`, icon: BookOpen },
    ...(data.adminStats ? [{ label: "School workspace", value: data.adminStats.users, detail: `${data.adminStats.classes} classes · ${data.adminStats.courses} courses`, icon: Users }] : []),
  ]

  return (
    <WorkspacePanel className={cn("grid overflow-hidden", metrics.length === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-3")}>
      {metrics.map(({ label, value, detail, icon: Icon }, index) => (
        <div key={label} className={cn("flex min-w-0 items-center gap-3 px-4 py-3", index > 0 && "border-t sm:border-l sm:border-t-0", metrics.length === 4 && index === 2 && "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0")}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><Icon className="size-4" /></span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2"><span className="text-xl font-semibold tabular-nums">{value}</span><span className="truncate text-xs font-medium">{label}</span></div>
            <p className="truncate text-xs text-muted-foreground">{detail}</p>
          </div>
        </div>
      ))}
    </WorkspacePanel>
  )
}

function TodayPanel({ data }: { data: HomeData }) {
  const scheduleHref = data.roles.includes("STUDENT") && !data.roles.includes("SUBJECT_TEACHER") ? "/student/schedule" : "/teacher/attendance"

  return (
    <WorkspacePanel className="overflow-hidden">
      <SectionHeading icon={CalendarDays} title="Today" description={format(data.now, "EEEE, MMMM d")} href={scheduleHref} linkLabel="Full schedule" />
      {data.today.length ? (
        <div className="divide-y">
          {data.today.map((item) => (
            <Link key={item.id} href={item.href} className="group grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--workspace-row-hover)]">
              <div>
                <span className="block text-xs font-semibold text-foreground">{getPeriodLabel(item.period)}</span>
                <span className="block text-[11px] text-muted-foreground">{item.perspective}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{item.subjectName}</span>
                  {item.perspective === "Teaching" && item.done && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">Attendance saved</span>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{item.className}{item.topic ? ` · ${item.topic}` : ""}</p>
              </div>
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                <span className="hidden sm:inline">{item.perspective === "Teaching" ? (item.done ? "Review" : "Take attendance") : "Open course"}</span>
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex min-h-36 flex-col items-center justify-center px-6 py-8 text-center">
          <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><Check className="size-5" /></span>
          <p className="text-sm font-medium">No classes on your schedule today</p>
          <p className="mt-1 text-xs text-muted-foreground">Use the time to prepare, review, or get ahead.</p>
        </div>
      )}
    </WorkspacePanel>
  )
}

function AttentionPanel({ data }: { data: HomeData }) {
  const items = [
    ...(data.pendingAttendance ? [{ label: "Attendance to take", value: data.pendingAttendance, href: "/teacher/attendance", tone: "amber" }] : []),
    ...(data.ungradedCount ? [{ label: "Submissions to grade", value: data.ungradedCount, href: "/teacher", tone: "indigo" }] : []),
    ...(data.studentAssignments.length ? [{ label: "Tasks to complete", value: data.studentAssignments.length, href: "/student/courses", tone: "rose" }] : []),
  ]

  return (
    <WorkspacePanel className="overflow-hidden">
      <SectionHeading icon={CircleAlert} title="Needs attention" description="The shortest path to being caught up" />
      {items.length ? (
        <div className="divide-y">
          {items.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--workspace-row-hover)]">
              <span className={cn("flex size-8 items-center justify-center rounded-md text-sm font-semibold tabular-nums", item.tone === "amber" && "bg-amber-500/10 text-amber-700 dark:text-amber-300", item.tone === "indigo" && "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300", item.tone === "rose" && "bg-rose-500/10 text-rose-700 dark:text-rose-300")}>{item.value}</span>
              <span className="min-w-0 flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex min-h-32 flex-col items-center justify-center px-6 py-7 text-center">
          <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><Check className="size-4" /></span>
          <p className="text-sm font-medium">You’re all caught up</p>
          <p className="mt-1 text-xs text-muted-foreground">Nothing urgent needs your attention.</p>
        </div>
      )}
    </WorkspacePanel>
  )
}

function UpcomingPanel({ data }: { data: HomeData }) {
  const teacherItems = data.teacherUpcoming.map((assignment) => ({
    id: `teacher-${assignment.id}`,
    title: assignment.title,
    context: `${assignment.course.subject?.name ?? assignment.course.name} · ${assignment.submissions.length} awaiting grades`,
    dueDate: assignment.dueDate,
    href: `/teacher/courses/${assignment.course.id}/tasks/${assignment.id}`,
    label: "Teaching",
  }))
  const studentItems = data.studentAssignments.map((assignment) => ({
    id: `student-${assignment.id}`,
    title: assignment.title,
    context: assignment.course.subject?.name ?? assignment.course.name,
    dueDate: assignment.dueDate,
    href: `/student/courses/${assignment.course.id}/tasks/${assignment.id}`,
    label: "Learning",
  }))
  const items = [...studentItems, ...teacherItems].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 6)

  return (
    <WorkspacePanel className="overflow-hidden">
      <SectionHeading icon={Clock3} title="Upcoming work" description="Deadlines across teaching and learning" />
      {items.length ? (
        <div className="divide-y">
          {items.map((item) => {
            const overdue = item.dueDate < data.now
            return (
              <Link key={item.id} href={item.href} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-[var(--workspace-row-hover)]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="truncate text-sm font-medium">{item.title}</span><span className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">{item.label}</span></div>
                  <p className="truncate text-xs text-muted-foreground">{item.context}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className={cn("text-xs font-medium", overdue && "text-rose-600 dark:text-rose-300")}>{overdue ? "Overdue" : isToday(item.dueDate) ? "Due today" : format(item.dueDate, "MMM d")}</p>
                    <p className="text-[11px] text-muted-foreground">{format(item.dueDate, "h:mm a")}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="px-4 py-7 text-center text-sm text-muted-foreground">No upcoming deadlines in the next seven days.</div>
      )}
    </WorkspacePanel>
  )
}

function WorkspacesPanel({ data }: { data: HomeData }) {
  const destinations = [
    data.roles.includes("SUBJECT_TEACHER") && { href: "/teacher", label: "Teaching", detail: `${data.teachingCount} active courses`, icon: BookOpen },
    data.roles.includes("STUDENT") && { href: "/student", label: "Learning", detail: `${data.learningCount} enrolled courses`, icon: GraduationCap },
    data.roles.includes("ADMIN") && { href: "/admin", label: "Administration", detail: `${data.adminStats?.users ?? 0} active users`, icon: Settings2 },
  ].filter(Boolean) as Array<{ href: string; label: string; detail: string; icon: typeof BookOpen }>

  return (
    <WorkspacePanel className="overflow-hidden">
      <SectionHeading icon={LayoutDashboard} title="Your workspaces" description="Jump into a focused dashboard" />
      <div className="divide-y">
        {destinations.map(({ href, label, detail, icon: Icon }) => (
          <Link key={href} href={href} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--workspace-row-hover)]">
            <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-600"><Icon className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{label}</span><span className="block truncate text-xs text-muted-foreground">{detail}</span></span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
      {data.recentGrades.length > 0 && (
        <div className="border-t bg-muted/20 px-4 py-3">
          <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold">Recent grades</span><Link href="/student/grades" className="text-xs text-indigo-600 dark:text-indigo-300">View all</Link></div>
          <div className="space-y-2">
            {data.recentGrades.map((grade) => (
              <div key={grade.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-muted-foreground">{grade.assignment.course.subject?.name ?? grade.assignment.course.name}</span>
                <span className="font-semibold tabular-nums">{Math.round(grade.grade ?? 0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </WorkspacePanel>
  )
}

export default async function HomePage() {
  const data = await getHomeData()
  if (!data) return null

  const firstPendingClass = data.today.find((item) => item.perspective === "Teaching" && !item.done)
  const firstStudentTask = data.studentAssignments[0]
  const primaryAction = firstPendingClass
    ? { href: firstPendingClass.href, label: "Take attendance" }
    : firstStudentTask
      ? { href: `/student/courses/${firstStudentTask.course.id}/tasks/${firstStudentTask.id}`, label: "Continue task" }
      : data.roles.includes("SUBJECT_TEACHER")
        ? { href: "/teacher", label: "Open teaching" }
        : { href: "/student", label: "Open learning" }

  return (
    <WorkspacePage className="p-0">
      <WorkspaceHeader className="workspace-context-header flex-wrap gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-300"><Sparkles className="size-3.5" />{format(data.now, "EEEE, MMMM d")}</div>
          <h1 className="truncate text-xl font-semibold">Welcome back, {data.name}</h1>
          <p className="text-sm text-muted-foreground">Here’s what needs your attention today.</p>
        </div>
        <div className="flex items-center gap-2">
          {(data.roles.includes("SUBJECT_TEACHER") || data.roles.includes("STUDENT")) && (
            <Button asChild variant="outline"><Link href={data.roles.includes("STUDENT") && !data.roles.includes("SUBJECT_TEACHER") ? "/student/schedule" : "/teacher/attendance"}><CalendarDays />Schedule</Link></Button>
          )}
          <Button asChild><Link href={primaryAction.href}>{primaryAction.label}<ArrowRight /></Link></Button>
        </div>
      </WorkspaceHeader>

      <MetricStrip data={data} />

      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.75fr)]">
        <div className="space-y-3">
          <TodayPanel data={data} />
          <UpcomingPanel data={data} />
        </div>
        <div className="space-y-3">
          <AttentionPanel data={data} />
          <WorkspacesPanel data={data} />
        </div>
      </div>
    </WorkspacePage>
  )
}
