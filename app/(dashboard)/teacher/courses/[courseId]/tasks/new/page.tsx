import { TaskForm } from "@/components/teacher/task-form"
import { getCourse } from "@/lib/actions/course.actions"
import { notFound } from "next/navigation"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

interface AddTaskPageProps {
    params: Promise<{
        courseId: string
    }>
}

export default async function AddTaskPage(props: AddTaskPageProps) {
    const params = await props.params;
    const { courseId } = params;

    const { course } = await getCourse(courseId)

    if (!course) {
        notFound()
    }

    return (
        <>
            <MobileHeaderSetter title="Create New Task" backLink="/teacher" />
            <TaskForm courseId={courseId} course={course as any} />
        </>
    )
}
