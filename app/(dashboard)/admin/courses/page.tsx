import { getCourses } from "@/lib/actions/course.actions"
import { getSemesters } from "@/lib/actions/academic-year.actions"
import { getUsers } from "@/lib/actions/user.actions"
import { getSubjects } from "@/lib/actions/subject.actions"
import { CourseList } from "@/components/admin/courses/course-list"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspacePage } from "@/components/workspace/workspace-page"

interface CoursesPageProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
    const params = await searchParams
    const showAll = params.showAll === "true"

    const { courses } = await getCourses({ showAll })
    const { terms } = await getSemesters()
    const { users: teachers } = await getUsers({ role: "SUBJECT_TEACHER", limit: 100 })
    const { subjects } = await getSubjects()

    return (
        <WorkspacePage>
            <MobileHeaderSetter title="Courses" subtitle="Create, link, enroll, and maintain teaching workspaces." />
            <CourseList
                courses={courses as any}
                teachers={teachers}
                terms={terms as any}
                subjects={subjects}
            />
        </WorkspacePage>
    )
}
