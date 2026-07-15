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

      <WorkspacePanel className="grid grid-cols-1 overflow-hidden sm:grid-cols-3">
        {quickActions.map(({ href, label, icon: Icon }, index) => (
          <Link key={href} href={href} className={cn("flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--workspace-row-hover)]", index > 0 && "border-t sm:border-l sm:border-t-0")}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><Icon className="size-4" /></span>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </WorkspacePanel>

      <Suspense fallback={<ClassesSkeleton />}><ClassesTodayCard /></Suspense>
      <Suspense fallback={<AssignmentsSkeleton />}><AssignmentsWidgetWrapper /></Suspense>
    </WorkspacePage>
  )
}
