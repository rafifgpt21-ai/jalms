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
        <div className="p-6 max-w-4xl mx-auto pb-20">
            <MobileHeaderSetter title={`Edit: ${quiz.title}`} backLink="/teacher/quiz-manager" />

            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
                <p className="text-muted-foreground">{quiz.description || "Add questions to your quiz."}</p>
            </div>

            <QuizEditorClient quiz={quiz} />
        </div>
    )
}
