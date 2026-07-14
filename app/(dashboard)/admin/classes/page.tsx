import { getClasses, getHomeroomTeachers, getActiveTerms } from "@/lib/actions/class.actions"
import { ClassList } from "@/components/admin/classes/class-list"
import { WorkspaceHeader, WorkspacePage } from "@/components/workspace/workspace-page"

export const dynamic = "force-dynamic"

export default async function ClassesPage() {
    const [classesData, teachersData, termsData] = await Promise.all([
        getClasses(),
        getHomeroomTeachers(),
        getActiveTerms()
    ])

    const classes = classesData.classes || []
    const teachers = teachersData.teachers || []
    const terms = termsData.terms || []

    const error = classesData.error || teachersData.error || termsData.error

    if (error) {
        return <div className="p-6 text-red-500">Error loading data: {error}</div>
    }

    return (
        <WorkspacePage>
            <WorkspaceHeader><h1 className="text-xl font-semibold">Classes</h1><p className="text-sm text-muted-foreground">Manage rosters, class colors, homeroom teachers, and linked courses.</p></WorkspaceHeader>
            <ClassList classes={classes} teachers={teachers} terms={terms} />
        </WorkspacePage>
    )
}
