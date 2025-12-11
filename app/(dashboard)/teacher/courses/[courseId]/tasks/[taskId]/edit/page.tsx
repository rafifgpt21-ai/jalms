import { TaskForm } from "@/components/teacher/task-form"
import { getAssignmentDetails } from "@/lib/actions/teacher.actions"
import { getQuizzes } from "@/lib/actions/quiz.actions"
import { notFound } from "next/navigation"

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

    // getAssignmentDetails includes course and subject
    const { assignment } = await getAssignmentDetails(taskId)
    const { quizzes } = await getQuizzes()

    if (!assignment) {
        notFound()
    }

    return (
        <TaskForm
            courseId={courseId}
            initialData={assignment as any}
            course={assignment.course as any}
            quizzes={quizzes || []}
        />
    )
}
