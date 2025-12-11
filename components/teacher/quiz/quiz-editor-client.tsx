"use client"

import { useState } from "react"
import { QuestionCard } from "@/components/teacher/quiz/question-card"
import { ExcelImportDialog } from "@/components/teacher/quiz/excel-import-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface QuizEditorClientProps {
    quiz: any
}

export function QuizEditorClient({ quiz }: QuizEditorClientProps) {
    const [isAddingNew, setIsAddingNew] = useState(false)

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                {quiz.questions && quiz.questions.map((question: any, index: number) => (
                    <QuestionCard
                        key={question.id}
                        quizId={quiz.id}
                        question={question}
                    />
                ))}
            </div>

            {isAddingNew && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <QuestionCard
                        quizId={quiz.id}
                        onCancelNew={() => setIsAddingNew(false)}
                    />
                </div>
            )}

            {!isAddingNew && (
                <div className="flex justify-center py-4 border-2 border-dashed rounded-lg">
                    <Button onClick={() => setIsAddingNew(true)} size="lg" variant="ghost">
                        <Plus className="mr-2 h-5 w-5" />
                        Add New Question
                    </Button>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t">
                <ExcelImportDialog quizId={quiz.id} />
            </div>
        </div>
    )
}
