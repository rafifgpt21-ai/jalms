import { getSubjects } from "@/lib/actions/subject.actions"
import { SubjectList } from "@/components/admin/subjects/subject-list"

export const dynamic = "force-dynamic"

export default async function SubjectsPage() {
    const { subjects } = await getSubjects()

    return (
        <div className="space-y-6">
            {/* Header removed to match Course/Class manager consistency */}

            <SubjectList subjects={subjects} />
        </div>
    )
}
