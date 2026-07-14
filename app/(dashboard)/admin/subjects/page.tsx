import { getSubjects } from "@/lib/actions/subject.actions"
import { SubjectList } from "@/components/admin/subjects/subject-list"
import { WorkspaceHeader, WorkspacePage } from "@/components/workspace/workspace-page"

export const dynamic = "force-dynamic"

export default async function SubjectsPage() {
    const { subjects } = await getSubjects()

    return (
        <WorkspacePage>
            <WorkspaceHeader><h1 className="text-xl font-semibold">Subjects</h1><p className="text-sm text-muted-foreground">Three-letter subject identities shared across courses.</p></WorkspaceHeader>
            <SubjectList subjects={subjects} />
        </WorkspacePage>
    )
}
