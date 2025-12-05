import { getCourses } from "@/lib/actions/course.actions"
import { getSemesters } from "@/lib/actions/academic-year.actions"
import { getUsers } from "@/lib/actions/user.actions"
import { CourseList } from "@/components/admin/courses/course-list"
import { CourseModal } from "@/components/admin/courses/course-modal"

interface CoursesPageProps {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
    const params = await searchParams
    const showAll = params.showAll === "true"

    const { courses } = await getCourses({ showAll })
    const { terms } = await getSemesters()
    const { users: teachers } = await getUsers({ role: "SUBJECT_TEACHER", limit: 100 })

    console.log("CoursesPage Fetched:", {
        coursesCount: courses.length,
        teachersCount: teachers.length,
        termsCount: terms.length,
        firstTerm: terms[0],
        firstTeacher: teachers[0]
    })

    return (
        <div className="space-y-6">


            <CourseList
                courses={courses as any}
                teachers={teachers}
                terms={terms as any}
            />
        </div>
    )
}
