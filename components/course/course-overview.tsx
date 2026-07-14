import Link from "next/link"
import { BookOpen, CalendarClock, FileText, Megaphone, Pin, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CourseIdentityBadge } from "@/components/course/course-identity-badge"
import { WorkspaceHeader, WorkspacePage, WorkspacePanel } from "@/components/workspace/workspace-page"

export function CourseOverview({ course, roleContext }: { course: any; roleContext: "teacher" | "student" }) {
  const base = `/${roleContext}/courses/${course.id}`
  const upcoming = course.assignments.filter((assignment: any) => new Date(assignment.dueDate) >= new Date()).slice(0, 4)
  return (
    <WorkspacePage>
      <WorkspaceHeader className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CourseIdentityBadge course={{ ...course, roleContext }} className="size-14" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold">{course.name}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {[course.subject?.name, course.class?.name, course.teacher?.name].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        {roleContext === "teacher" && <Button asChild size="sm"><Link href={`${base}/tasks/new`}>Create task</Link></Button>}
      </WorkspaceHeader>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          [Users, roleContext === "teacher" ? course._count.students : course.class?.name || "Course", roleContext === "teacher" ? "Students" : "Class"],
          [BookOpen, course._count.assignments, "Tasks"],
          [FileText, course._count.materials, "Materials"],
          [CalendarClock, upcoming.length, "Upcoming"],
        ].map(([Icon, value, label]: any) => (
          <WorkspacePanel key={label} className="flex items-center gap-3 p-3">
            <Icon className="size-4 text-indigo-500" /><div><div className="font-semibold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
          </WorkspacePanel>
        ))}
      </div>

      <div className="grid min-h-0 gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        <WorkspacePanel className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-semibold">Upcoming work</h2><Button variant="ghost" size="sm" asChild><Link href={`${base}/tasks`}>View all</Link></Button></div>
          <div className="divide-y">
            {upcoming.length ? upcoming.map((assignment: any) => (
              <Link key={assignment.id} href={`${base}/tasks/${assignment.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
                <div className="min-w-0"><div className="truncate text-sm font-medium">{assignment.title}</div><div className="text-xs text-muted-foreground">Due {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(assignment.dueDate)}</div></div>
                <Badge variant="secondary">{assignment.type.replace("_", " ")}</Badge>
              </Link>
            )) : <div className="px-4 py-10 text-center text-sm text-muted-foreground">No upcoming work.</div>}
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-semibold">Announcements</h2><Button variant="ghost" size="sm" asChild><Link href={`${base}/announcements`}>View all</Link></Button></div>
          <div className="divide-y">
            {course.announcements.length ? course.announcements.map((item: any) => (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-sm font-medium">{item.isPinned && <Pin className="size-3 text-indigo-500" />}{item.title}</div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.body}</p>
              </div>
            )) : <div className="flex flex-col items-center px-4 py-10 text-center text-sm text-muted-foreground"><Megaphone className="mb-2 size-5" />No announcements yet.</div>}
          </div>
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  )
}
