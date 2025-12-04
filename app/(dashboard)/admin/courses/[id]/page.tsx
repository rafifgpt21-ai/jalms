import { notFound } from "next/navigation"
import { getCourse } from "@/lib/actions/course.actions"
import { CourseStudentList } from "@/components/admin/courses/course-student-list"
import { AddCourseStudentModal } from "@/components/admin/courses/add-course-student-modal"
import { AddClassToCourseModal } from "@/components/admin/courses/add-class-to-course-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CourseWorkspacePageProps {
    params: {
        id: string
    }
}

export default async function CourseWorkspacePage({ params }: CourseWorkspacePageProps) {
    const { id } = await params
    const { course, error } = await getCourse(id)

    if (!course || error) {
        notFound()
    }

    const students = course.students

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/courses">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{course.name}</h1>
                    <p className="text-muted-foreground">
                        {course.teacher.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {course.term.academicYear.name} - {course.term.type === "ODD" ? "Odd" : "Even"}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Enrolled Students ({students.length})</h2>
                <div className="flex gap-2">
                    <AddClassToCourseModal courseId={id} />
                    <AddCourseStudentModal courseId={id} />
                </div>
            </div>

            <CourseStudentList students={students} courseId={id} />
        </div>
    )
}
