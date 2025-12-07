import { TaskForm } from "@/components/teacher/task-form"

interface AddTaskPageProps {
    params: Promise<{
        courseId: string
    }>
}

export default async function AddTaskPage(props: AddTaskPageProps) {
    const params = await props.params;

    const {
        courseId
    } = params;

    return (
        <TaskForm courseId={courseId} />
    )
}
