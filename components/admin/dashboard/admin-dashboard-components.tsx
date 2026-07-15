import Link from "next/link"
import { format } from "date-fns"
import { Activity, ArrowRight, Clock3, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { WorkspacePanel } from "@/components/workspace/workspace-page"
import { getAttendancePulse, getTotalUsersCount, getLastLoggedInUsers } from "@/lib/actions/dashboard.actions"

function PanelHeading({ title, description, href, label }: { title: string; description: string; href?: string; label?: string }) {
  return <div className="flex min-h-12 items-center justify-between gap-3 border-b px-4 py-2.5"><div className="min-w-0"><h2 className="truncate text-sm font-semibold">{title}</h2><p className="truncate text-xs text-muted-foreground">{description}</p></div>{href && <Button asChild size="sm" variant="ghost"><Link href={href}>{label || "View all"}<ArrowRight /></Link></Button>}</div>
}

export async function AttendancePulseCard() {
  const { attendance } = await getAttendancePulse()
  const stats = attendance || { percentage: 0, totalRecords: 0, presentCount: 0, absentCount: 0 }
  return (
    <WorkspacePanel className="overflow-hidden">
      <PanelHeading title="Today's attendance" description="Live school-wide pulse" href="/admin/schedule" label="Schedule" />
      <div className="flex min-h-32 items-center gap-4 px-4 py-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><Activity className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className="text-3xl font-semibold tracking-tight tabular-nums">{stats.percentage}%</span><span className="text-sm font-medium">present</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, stats.percentage)}%` }} /></div>
          <p className="mt-2 text-xs text-muted-foreground">{stats.presentCount} present · {stats.absentCount} other records · {stats.totalRecords} total today</p>
        </div>
      </div>
    </WorkspacePanel>
  )
}

export async function TotalUsersCard() {
  const { totalUsers } = await getTotalUsersCount()
  return (
    <WorkspacePanel className="overflow-hidden">
      <PanelHeading title="Active accounts" description="Current school workspace" href="/admin/users" label="Manage" />
      <Link href="/admin/users" className="group flex min-h-32 items-center gap-4 px-4 py-4 transition-colors hover:bg-[var(--workspace-row-hover)]">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-300"><Users className="size-5" /></span>
        <span className="min-w-0 flex-1"><span className="block text-3xl font-semibold tracking-tight tabular-nums">{totalUsers || 0}</span><span className="block text-xs text-muted-foreground">Users able to access ARSync</span></span>
        <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground" />
      </Link>
    </WorkspacePanel>
  )
}

export async function RecentLoginList() {
  const { lastLoggedInUsers } = await getLastLoggedInUsers()
  return (
    <WorkspacePanel className="overflow-hidden">
      <PanelHeading title="Recent login activity" description="Latest workspace access" href="/admin/users" label="Users" />
      {lastLoggedInUsers?.length ? <div className="divide-y">{lastLoggedInUsers.map((user) => (
        <Link key={user.id} href="/admin/users" className="group flex min-h-14 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--workspace-row-hover)]">
          <Avatar className="size-8"><AvatarImage src={user.image || undefined} alt={user.name} /><AvatarFallback className="text-xs font-semibold">{user.name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{user.name}</span><span className="block truncate text-xs text-muted-foreground">{user.email}</span></span>
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground"><Clock3 className="size-3.5" />{user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, h:mm a") : "Never"}</span>
        </Link>
      ))}</div> : <div className="px-4 py-8 text-center"><p className="text-sm font-medium">No recent login activity</p><p className="mt-1 text-xs text-muted-foreground">New activity will appear here.</p></div>}
    </WorkspacePanel>
  )
}
