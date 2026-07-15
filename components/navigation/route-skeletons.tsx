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

export function TaskRouteSkeleton() {
  return (
    <WorkspacePage aria-label="Loading tasks" aria-busy="true">
      <WorkspacePanel className="grid grid-cols-3 overflow-hidden sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={`flex min-w-0 items-center gap-2 px-3 py-2.5 sm:gap-3 ${index < 2 ? "border-r" : "sm:border-r"}`}>
            <Skeleton className="hidden size-4 shrink-0 min-[430px]:block" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-3 w-16 max-w-full" />
            </div>
          </div>
        ))}
        <div className="col-span-3 flex gap-2 border-t p-2 sm:col-span-1 sm:items-center sm:border-t-0 sm:px-3">
          <Skeleton className="h-11 min-w-0 flex-1 sm:hidden" />
          <Skeleton className="h-11 min-w-0 flex-1 sm:h-8 sm:w-28 sm:flex-none" />
        </div>
      </WorkspacePanel>

      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
            <Skeleton className="h-8 w-full sm:max-w-xs" />
            <Skeleton className="h-8 w-full sm:w-40" />
          </div>
          <Skeleton className="h-3 w-20" />
        </div>

        <WorkspacePanel className="divide-y overflow-hidden md:hidden">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2 px-3 py-3">
              <div className="flex items-center gap-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-16" /></div>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </WorkspacePanel>

        <WorkspacePanel className="hidden min-h-[24rem] overflow-hidden md:block">
          <div className="grid h-10 grid-cols-[2fr_1fr_1fr_5rem_5rem_7rem] items-center gap-4 border-b bg-muted/30 px-3">
            {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-3 w-full" />)}
          </div>
          <div className="divide-y">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="grid h-14 grid-cols-[2fr_1fr_1fr_5rem_5rem_7rem] items-center gap-4 px-3">
                <div className="space-y-1.5"><Skeleton className="h-3 w-20" /><Skeleton className="h-4 w-3/4" /></div>
                <Skeleton className="h-4 w-24" /><Skeleton className="h-5 w-16" /><Skeleton className="h-4 w-8" /><Skeleton className="h-4 w-8" /><Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  )
}

export function TaskGradingRouteSkeleton() {
  return (
    <WorkspacePage aria-label="Loading task grading" aria-busy="true">
      <WorkspacePanel className="grid grid-cols-3 overflow-hidden sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={`flex min-w-0 items-center gap-2 px-3 py-2.5 sm:gap-3 ${index < 2 ? "border-r" : "sm:border-r"}`}>
            <Skeleton className="hidden size-4 shrink-0 min-[430px]:block" />
            <div className="min-w-0 flex-1 space-y-1.5"><Skeleton className="h-3 w-14" /><Skeleton className="h-4 w-24 max-w-full" /></div>
          </div>
        ))}
        <div className="col-span-3 gap-2 border-t p-2 sm:col-span-1 sm:flex sm:items-center sm:border-t-0 sm:px-3">
          <Skeleton className="hidden h-7 w-24 lg:block" />
          <Skeleton className="h-7 w-full sm:w-24" />
        </div>
      </WorkspacePanel>

      <WorkspacePanel className="overflow-hidden">
        <div className="flex h-11 items-center justify-between border-b px-3"><Skeleton className="h-4 w-32" /><Skeleton className="size-4" /></div>
        <div className="space-y-2 px-3 py-3"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div>
      </WorkspacePanel>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <WorkspacePanel key={index} className="flex h-16 items-center gap-2 p-3">
            <Skeleton className="size-4" /><div className="space-y-1.5"><Skeleton className="h-4 w-8" /><Skeleton className="h-3 w-20" /></div>
          </WorkspacePanel>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"><Skeleton className="h-8 w-full sm:max-w-xs" /><Skeleton className="h-8 w-full sm:w-44" /></div>
          <Skeleton className="h-3 w-20" />
        </div>
        <WorkspacePanel className="divide-y overflow-hidden md:hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-3 p-3">
              <div className="flex justify-between gap-3"><div className="w-1/2 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-full" /></div><Skeleton className="h-8 w-20" /></div>
              <Skeleton className="h-5 w-28" /><Skeleton className="h-10 w-full" />
            </div>
          ))}
        </WorkspacePanel>
        <WorkspacePanel className="hidden min-h-[22rem] overflow-hidden md:block">
          <div className="grid h-10 grid-cols-[1.5fr_1fr_1fr_.7fr_1fr] items-center gap-4 border-b bg-muted/30 px-3">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-3 w-full" />)}</div>
          <div className="divide-y">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="grid h-14 grid-cols-[1.5fr_1fr_1fr_.7fr_1fr] items-center gap-4 px-3">
                <div className="space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-40" /></div><Skeleton className="h-5 w-20" /><Skeleton className="h-4 w-24" /><Skeleton className="h-7 w-16" /><Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </WorkspacePanel>
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
