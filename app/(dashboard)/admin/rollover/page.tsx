import { db } from "@/lib/db"
import { RolloverWorkspace } from "@/components/admin/rollover/rollover-workspace"
import { WorkspaceHeader, WorkspacePage } from "@/components/workspace/workspace-page"

export default async function Page() {
  const [terms, recent] = await Promise.all([
    db.term.findMany({ where: { deletedAt: { isSet: false } }, include: { academicYear: true }, orderBy: { startDate: "desc" } }),
    db.academicRollover.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ])
  return <WorkspacePage><WorkspaceHeader><h1 className="text-xl font-semibold">Semester rollover</h1><p className="text-sm text-muted-foreground">Carry teaching setup forward without copying academic outcomes.</p></WorkspaceHeader><RolloverWorkspace terms={terms} recent={recent} /></WorkspacePage>
}
