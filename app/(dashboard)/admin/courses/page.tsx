import { getCourses } from "@/lib/actions/course.actions"
import { getSemesters } from "@/lib/actions/academic-year.actions"
import { getUsers } from "@/lib/actions/user.actions"
import { CourseList } from "@/components/admin/courses/course-list"
import { CourseModal } from "@/components/admin/courses/course-modal"
import { CourseToolbar } from "@/components/admin/courses/course-toolbar"

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
                    <p className="text-muted-foreground">
                        Manage courses.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <CourseToolbar />
                    <CourseModal
                        terms={terms as any}
                        teachers={teachers}
                    />
                </div>
            </div>

            <CourseList
                courses={courses as any}
                teachers={teachers}
                terms={terms as any}
            />
        </div>
    )
}
