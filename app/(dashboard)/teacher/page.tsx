import { Suspense } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Clock, FileQuestion, FileText } from "lucide-react"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspacePage, WorkspacePanel } from "@/components/workspace/workspace-page"
import { ClassesTodayCard, AssignmentsWidgetWrapper } from "@/components/teacher/dashboard/dashboard-components"
import { ClassesSkeleton, AssignmentsSkeleton } from "@/components/teacher/dashboard/skeletons"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const quickActions = [
  { href: "/teacher/attendance", label: "Attendance", icon: Clock },
  { href: "/teacher/quiz-manager", label: "Quiz library", icon: FileQuestion },
  { href: "/teacher/materials", label: "Material library", icon: FileText },
]

export default function TeacherDashboard() {
  return (
    <WorkspacePage>
      <MobileHeaderSetter title="Teaching dashboard" subtitle={format(new Date(), "EEEE, MMMM d")} />

      <WorkspacePanel className="order-2 grid grid-cols-3 overflow-hidden sm:order-none">
        {quickActions.map(({ href, label, icon: Icon }, index) => (
          <Link key={href} href={href} className={cn("flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-2 py-2 text-center transition-colors hover:bg-[var(--workspace-row-hover)] sm:min-h-14 sm:flex-row sm:justify-start sm:gap-3 sm:px-4 sm:py-3 sm:text-left", index > 0 && "border-l")}>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:size-8"><Icon className="size-4" /></span>
            <span className="min-w-0 text-xs font-medium leading-tight sm:text-sm">{label}</span>
          </Link>
        ))}
      </WorkspacePanel>

      <div className="order-1 sm:contents"><Suspense fallback={<ClassesSkeleton />}><ClassesTodayCard /></Suspense></div>
      <div className="order-3 sm:contents"><Suspense fallback={<AssignmentsSkeleton />}><AssignmentsWidgetWrapper /></Suspense></div>
    </WorkspacePage>
  )
}
