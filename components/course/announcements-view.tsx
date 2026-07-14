import { Pin } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { AnnouncementComposer } from "@/components/course/announcement-composer"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspaceActions, WorkspacePage, WorkspacePanel } from "@/components/workspace/workspace-page"

export function AnnouncementsView({ courseId, announcements, canPost }: { courseId: string; announcements: any[]; canPost: boolean }) {
  return <WorkspacePage>
    <MobileHeaderSetter title="Announcements" subtitle="Course-wide updates in one focused feed." />
    {canPost && <WorkspaceActions><AnnouncementComposer courseId={courseId} /></WorkspaceActions>}
    <div className="mx-auto w-full max-w-4xl space-y-2">
      {announcements.map(item => <WorkspacePanel key={item.id} className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2"><div className="flex items-center gap-2"><h2 className="font-semibold">{item.title}</h2>{item.isPinned && <Pin className="size-3.5 text-indigo-500" />}</div><StatusBadge status={item.status} /></div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.body}</p>
        <p className="mt-3 text-xs text-muted-foreground">{item.author.name} · {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(item.publishedAt || item.createdAt)}</p>
      </WorkspacePanel>)}
      {!announcements.length && <WorkspacePanel className="p-12 text-center text-sm text-muted-foreground">No announcements yet.</WorkspacePanel>}
    </div>
  </WorkspacePage>
}
