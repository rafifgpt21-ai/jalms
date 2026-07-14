import { getQuiz } from "@/lib/actions/quiz.actions"
import { notFound } from "next/navigation"
import { QuizEditorClient } from "@/components/teacher/quiz/quiz-editor-client"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

interface QuizEditorPageProps {
    params: Promise<{
        quizId: string
    }>
}

export default async function QuizEditorPage(props: QuizEditorPageProps) {
    const params = await props.params;
    const {
        quizId
    } = params;

    const { quiz, error } = await getQuiz(quizId)

    if (error || !quiz) {
        // handle error or not found
        if (error === "Quiz not found") notFound()
        return <div>Error: {error}</div>
    }

    return (
        <div className="md:p-8 max-w-3xl md:mx-auto pb-20">
            <MobileHeaderSetter title={`Edit: ${quiz.title}`} subtitle={quiz.description || "Add questions to your quiz."} backLink="/teacher/quiz-manager" />

            <QuizEditorClient quiz={quiz} />
        </div>
    )
}
