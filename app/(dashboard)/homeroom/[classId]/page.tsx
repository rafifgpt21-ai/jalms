import { getHomeroomClassDetails } from "@/lib/actions/homeroom.actions"
import { ClassDetailsView } from "@/components/homeroom/class-details-view"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{
        classId: string
    }>
}

export default async function HomeroomClassPage(props: PageProps) {
    const params = await props.params;

    const { classId } = params;

    const { classData, students, error } = await getHomeroomClassDetails(classId)

    if (error || !classData || !students) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-lg">Error: {error || "Failed to load class data"}</div>
    }

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title={classData.name} />
            <ClassDetailsView classData={classData} students={students!} />
        </div>
    )
}
