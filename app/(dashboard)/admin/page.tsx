import { Suspense } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Activity, BookOpen, Calendar, CalendarRange, School, Users } from "lucide-react"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspacePage, WorkspacePanel } from "@/components/workspace/workspace-page"
import { cn } from "@/lib/utils"
import { AttendancePulseCard, TotalUsersCard, RecentLoginList } from "@/components/admin/dashboard/admin-dashboard-components"
import { PulseSkeleton, TotalUsersSkeleton, RecentLoginSkeleton } from "@/components/admin/dashboard/admin-skeletons"

export const dynamic = "force-dynamic"

const quickActions = [
  { href: "/admin/schedule", icon: Calendar, label: "Schedule" },
  { href: "/admin/classes", icon: School, label: "Classes" },
  { href: "/admin/courses", icon: BookOpen, label: "Courses" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/semesters", icon: CalendarRange, label: "Semesters" },
  { href: "/admin/socials", icon: Activity, label: "Socials" },
]

export default function AdminDashboard() {
  return (
    <WorkspacePage>
      <MobileHeaderSetter title="Administration dashboard" subtitle={format(new Date(), "EEEE, MMMM d")} />

      <WorkspacePanel className="grid grid-cols-2 overflow-hidden sm:grid-cols-3 xl:grid-cols-6">
        {quickActions.map(({ href, icon: Icon, label }, index) => <Link key={href} href={href} className={cn("flex min-h-14 items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-[var(--workspace-row-hover)] sm:border-l xl:border-t-0 xl:first:border-l-0", index >= 2 && "border-t", index % 2 === 1 && "border-l", index >= 3 && "sm:border-t", index % 3 === 0 && "sm:border-l-0")}><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><Icon className="size-4" /></span><span className="truncate text-sm font-medium">{label}</span></Link>)}
      </WorkspacePanel>

      <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,.6fr)]">
        <Suspense fallback={<PulseSkeleton />}><AttendancePulseCard /></Suspense>
        <Suspense fallback={<TotalUsersSkeleton />}><TotalUsersCard /></Suspense>
      </div>

      <Suspense fallback={<RecentLoginSkeleton />}><RecentLoginList /></Suspense>
    </WorkspacePage>
  )
}
