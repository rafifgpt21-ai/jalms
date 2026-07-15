import Link from "next/link"
import { ArrowRight, GraduationCap, School, Users } from "lucide-react"
import { WorkspacePanel } from "@/components/workspace/workspace-page"

interface HomeroomDashboardViewProps {
  classes: Array<{
    id: string
    name: string
    term: { type: string; academicYear?: { name: string } | null }
    _count: { students: number }
  }>
}

export function HomeroomDashboardView({ classes }: HomeroomDashboardViewProps) {
  const studentCount = classes.reduce((total, item) => total + item._count.students, 0)

  return (
    <>
      <WorkspacePanel className="grid overflow-hidden sm:grid-cols-2">
        <div className="flex min-h-16 items-center gap-3 px-4 py-3"><span className="flex size-9 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><School className="size-4" /></span><span><span className="flex items-baseline gap-2"><span className="text-xl font-semibold tabular-nums">{classes.length}</span><span className="text-xs font-medium">Active classes</span></span><span className="block text-xs text-muted-foreground">Assigned this term</span></span></div>
        <div className="flex min-h-16 items-center gap-3 border-t px-4 py-3 sm:border-l sm:border-t-0"><span className="flex size-9 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300"><Users className="size-4" /></span><span><span className="flex items-baseline gap-2"><span className="text-xl font-semibold tabular-nums">{studentCount}</span><span className="text-xs font-medium">Students</span></span><span className="block text-xs text-muted-foreground">Across homeroom classes</span></span></div>
      </WorkspacePanel>

      <WorkspacePanel className="overflow-hidden">
        <div className="border-b px-4 py-2.5"><h2 className="text-sm font-semibold">Your homeroom classes</h2><p className="text-xs text-muted-foreground">Monitor students, grades, and reports</p></div>
        {classes.length ? <div className="divide-y">{classes.map((item) => (
          <Link key={item.id} href={`/homeroom/${item.id}`} className="group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--workspace-row-hover)]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><GraduationCap className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.name}</span><span className="block truncate text-xs text-muted-foreground">{item.term.academicYear?.name || "Current academic year"} · {item.term.type.toLowerCase()} semester</span></span>
            <span className="shrink-0 text-right"><span className="block text-sm font-semibold tabular-nums">{item._count.students}</span><span className="text-[11px] text-muted-foreground">students</span></span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
          </Link>
        ))}</div> : <div className="px-4 py-10 text-center"><GraduationCap className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="text-sm font-medium">No homeroom class assigned</p><p className="mt-1 text-xs text-muted-foreground">An administrator can assign an active class to this account.</p></div>}
      </WorkspacePanel>
    </>
  )
}
