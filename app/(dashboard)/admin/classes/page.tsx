import { getClasses, getHomeroomTeachers, getActiveTerms } from "@/lib/actions/class.actions"
import { ClassList } from "@/components/admin/classes/class-list"
import { ClassModal } from "@/components/admin/classes/class-modal"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

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

    console.log("ClassesPage Fetched:", {
        classesCount: classes.length,
        teachersCount: teachers.length,
        termsCount: terms.length,
        firstTerm: terms[0],
        firstTeacher: teachers[0]
    })

    const error = classesData.error || teachersData.error || termsData.error

    if (error) {
        return <div className="p-6 text-red-500">Error loading data: {error}</div>
    }

    return (
        <div>
            <MobileHeaderSetter title="Classroom Manager" />
            <ClassList classes={classes} teachers={teachers} terms={terms} />
        </div>
    )
}
