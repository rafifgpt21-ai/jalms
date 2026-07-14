import { getClasses, getHomeroomTeachers, getActiveTerms } from "@/lib/actions/class.actions"
import { ClassList } from "@/components/admin/classes/class-list"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspacePage } from "@/components/workspace/workspace-page"

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
            <MobileHeaderSetter title="Classes" subtitle="Manage rosters, class colors, homeroom teachers, and linked courses." />
            <ClassList classes={classes} teachers={teachers} terms={terms} />
        </WorkspacePage>
    )
}
