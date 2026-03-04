import { CourseCompetencySettings } from "@/components/teacher/course-competency-settings"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

interface PageProps {
    params: Promise<{
        courseId: string
    }>
}

export default async function CourseSettingsPage(props: PageProps) {
    const params = await props.params;
    const { courseId } = params

    return (
        <div className="space-y-6 container mx-auto p-6 pb-20">
            <MobileHeaderSetter title="Course Settings" />

            <div>
                <h1 className="text-2xl font-bold tracking-tight">Course Settings</h1>
                <p className="text-muted-foreground">
                    Manage grading criteria and competency descriptions.
                </p>
            </div>

            <div className="max-w-4xl">
                <CourseCompetencySettings courseId={courseId} />
            </div>
        </div>
    )
}
