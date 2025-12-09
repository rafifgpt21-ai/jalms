import { getSubjects } from "@/lib/actions/subject.actions"
import { SubjectList } from "@/components/admin/subjects/subject-list"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export const dynamic = "force-dynamic"

export default async function SubjectsPage() {
    const { subjects } = await getSubjects()

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Subject Manager" />

            <SubjectList subjects={subjects} />
        </div>
    )
}
