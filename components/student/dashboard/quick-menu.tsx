import Link from "next/link"
import { BookOpen, Calendar, GraduationCap, User, ClipboardCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { WorkspacePanel } from "@/components/workspace/workspace-page"
import { cn } from "@/lib/utils"

const links = [
  { label: "Courses", href: "/student/courses", icon: BookOpen },
  { label: "Schedule", href: "/student/schedule", icon: Calendar },
  { label: "Grades", href: "/student/grades", icon: GraduationCap },
  { label: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
  { label: "Profile", href: "/student/learning-profile", icon: User },
]

export function QuickMenu() {
  return (
    <WorkspacePanel className="grid grid-cols-2 overflow-hidden sm:grid-cols-5">
      {links.map(({ label, href, icon: Icon }, index) => (
        <Link key={href} href={href} className={cn("flex min-h-14 items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-[var(--workspace-row-hover)] sm:border-l sm:border-t-0 sm:first:border-l-0", index >= 2 && "border-t", index % 2 === 1 && "border-l")}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><Icon className="size-4" /></span><span className="truncate text-sm font-medium">{label}</span>
        </Link>
      ))}
    </WorkspacePanel>
  )
}

export function QuickMenuSkeleton() {
  return <WorkspacePanel className="grid grid-cols-2 overflow-hidden sm:grid-cols-5" aria-label="Loading learning shortcuts" aria-busy="true">{Array.from({ length: 5 }, (_, index) => <div key={index} className={cn("flex h-14 items-center gap-2.5 px-3 sm:border-l sm:border-t-0 sm:first:border-l-0", index >= 2 && "border-t", index % 2 === 1 && "border-l")}><Skeleton className="size-8" /><Skeleton className="h-4 w-16" /></div>)}</WorkspacePanel>
}
