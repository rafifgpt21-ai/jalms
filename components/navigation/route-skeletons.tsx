import { Skeleton } from "@/components/ui/skeleton"
import { WorkspacePage, WorkspacePanel } from "@/components/workspace/workspace-page"

function SkeletonHeader() {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 border-b pb-2" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64 max-w-[60vw]" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  )
}

export function DashboardRouteSkeleton() {
  return (
    <WorkspacePage aria-label="Loading dashboard" aria-busy="true">
      <SkeletonHeader />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <WorkspacePanel key={index} className="flex h-28 flex-col justify-between p-4">
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-3 w-24" /></div>
          </WorkspacePanel>
        ))}
      </div>
      <div className="grid min-h-[28rem] gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,.6fr)]">
        <WorkspacePanel className="p-4"><Skeleton className="mb-5 h-5 w-40" /><Skeleton className="h-[23rem] w-full" /></WorkspacePanel>
        <WorkspacePanel className="p-4"><Skeleton className="mb-5 h-5 w-32" /><div className="space-y-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div></WorkspacePanel>
      </div>
    </WorkspacePage>
  )
}

export function TableRouteSkeleton() {
  return (
    <WorkspacePage aria-label="Loading list" aria-busy="true">
      <SkeletonHeader />
      <TablePanelSkeleton />
    </WorkspacePage>
  )
}

export function TablePanelSkeleton() {
  return (
      <WorkspacePanel className="min-h-[34rem] overflow-hidden" aria-label="Loading table" aria-busy="true">
        <div className="flex min-h-14 items-center gap-3 border-b p-3">
          <Skeleton className="h-8 flex-1 max-w-sm" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="grid h-10 grid-cols-[2fr_1fr_1fr_6rem] gap-4 border-b bg-muted/30 px-4 py-3">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-3 w-full" />)}
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="grid h-14 grid-cols-[2fr_1fr_1fr_6rem] items-center gap-4 px-4">
              <Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-5 w-20" /><Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </WorkspacePanel>
  )
}

export function CourseRouteSkeleton() {
  return (
    <WorkspacePage aria-label="Loading course" aria-busy="true">
      <div className="flex min-h-16 items-center gap-3 border-b pb-3">
        <Skeleton className="size-14 rounded-xl" />
        <div className="space-y-2"><Skeleton className="h-6 w-52" /><Skeleton className="h-4 w-72 max-w-[60vw]" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <WorkspacePanel key={index} className="h-16 p-3"><Skeleton className="h-full w-full" /></WorkspacePanel>)}
      </div>
      <div className="grid min-h-[25rem] gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        {[5, 4].map((rows, panel) => (
          <WorkspacePanel key={panel} className="overflow-hidden">
            <div className="flex h-12 items-center justify-between border-b px-4"><Skeleton className="h-5 w-32" /><Skeleton className="h-8 w-16" /></div>
            <div className="divide-y">{Array.from({ length: rows }, (_, index) => <div key={index} className="flex h-16 items-center justify-between px-4"><div className="w-2/3 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-6 w-20" /></div>)}</div>
          </WorkspacePanel>
        ))}
      </div>
    </WorkspacePage>
  )
}

export function GridRouteSkeleton() {
  return (
    <WorkspacePage aria-label="Loading cards" aria-busy="true">
      <SkeletonHeader />
      <GridContentSkeleton />
    </WorkspacePage>
  )
}

export function GridContentSkeleton() {
  return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <WorkspacePanel key={index} className="h-64 overflow-hidden p-0">
            <Skeleton className="h-36 w-full rounded-none" />
            <div className="space-y-3 p-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-full" /></div>
          </WorkspacePanel>
        ))}
      </div>
  )
}
