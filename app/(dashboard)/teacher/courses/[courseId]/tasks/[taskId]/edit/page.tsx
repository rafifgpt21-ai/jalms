import { TaskForm } from "@/components/teacher/task-form"
import { getAssignmentDetails } from "@/lib/actions/teacher.actions"
import { redirect } from "next/navigation"

interface EditTaskPageProps {
    params: Promise<{
        courseId: string
        taskId: string
    }>
}

export default async function EditTaskPage(props: EditTaskPageProps) {
    const params = await props.params;

    const {
        courseId,
        taskId
    } = params;

    const { assignment, error } = await getAssignmentDetails(taskId)

    if (error || !assignment) {
        redirect(`/teacher/courses/${courseId}`)
    }

    return (
        <TaskForm courseId={courseId} assignment={assignment} />
    )
}
