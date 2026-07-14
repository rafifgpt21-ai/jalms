import { cache, Suspense } from "react"
import Link from "next/link"
import { BookOpen, Calendar, Clock, GraduationCap, Settings2 } from "lucide-react"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { WorkspaceHeader, WorkspacePage, WorkspacePanel } from "@/components/workspace/workspace-page"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

const getHomeData = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { roles: true } })
  const roles = user?.roles ?? []

  const [teachingCount, enrolledCount, dueSoon] = await Promise.all([
    roles.includes("SUBJECT_TEACHER") ? db.course.count({ where: { teacherId: session.user.id, term: { isActive: true }, deletedAt: { isSet: false } } }) : 0,
    roles.includes("STUDENT") ? db.course.count({ where: { studentIds: { has: session.user.id }, term: { isActive: true }, deletedAt: { isSet: false } } }) : 0,
    roles.includes("STUDENT") ? db.assignment.count({
      where: {
        course: { studentIds: { has: session.user.id }, term: { isActive: true } },
        dueDate: { gte: new Date(), lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        deletedAt: { isSet: false },
      },
    }) : 0,
  ])

  return {
    name: session.user.nickname || session.user.name?.split(" ")[0],
    destinations: [
    roles.includes("SUBJECT_TEACHER") && { href: "/teacher", label: "Teaching dashboard", description: `${teachingCount} active courses`, icon: BookOpen },
    roles.includes("STUDENT") && { href: "/student", label: "Learning dashboard", description: `${enrolledCount} enrolled courses`, icon: GraduationCap },
    roles.includes("STUDENT") && { href: "/student/schedule", label: "Weekly schedule", description: "Classes and periods", icon: Calendar },
    roles.includes("STUDENT") && { href: "/student/courses", label: "Due soon", description: `${dueSoon} tasks in the next 7 days`, icon: Clock },
    roles.includes("ADMIN") && { href: "/admin", label: "Administration", description: "Academic setup and users", icon: Settings2 },
    ].filter(Boolean) as Array<{ href: string; label: string; description: string; icon: typeof BookOpen }>,
  }
})

async function GreetingName() {
  const data = await getHomeData()
  return data?.name ? <>{data.name}</> : null
}

async function HomeDestinations() {
  const data = await getHomeData()
  if (!data) return null

  return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.destinations.map(({ href, label, description, icon: Icon }) => (
          <Link href={href} prefetch key={href}>
            <WorkspacePanel className="flex min-h-20 items-center gap-3 p-3 transition-colors hover:bg-[var(--workspace-row-hover)]">
              <span className="flex size-9 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><Icon className="size-4" /></span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">{description}</span>
              </span>
            </WorkspacePanel>
          </Link>
        ))}
      </div>
  )
}

function DestinationSkeleton() {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading destinations" aria-busy="true">
    {Array.from({ length: 5 }, (_, index) => <WorkspacePanel key={index} className="flex h-20 items-center gap-3 p-3"><Skeleton className="size-9 rounded-md" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/2" /></div></WorkspacePanel>)}
  </div>
}

export default function HomePage() {
  return (
    <WorkspacePage className="p-0">
      <WorkspaceHeader className="workspace-context-header">
        <div>
          <h1 className="flex min-h-7 items-center gap-1 text-xl font-semibold">Welcome back,<Suspense fallback={<Skeleton className="inline-block h-6 w-24" />}><GreetingName /></Suspense></h1>
          <p className="text-sm text-muted-foreground">Continue with the work that needs your attention.</p>
        </div>
      </WorkspaceHeader>
      <Suspense fallback={<DestinationSkeleton />}><HomeDestinations /></Suspense>
    </WorkspacePage>
  )
}
