"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { QuestionCard, type QuizEditorQuestion } from "@/components/teacher/quiz/question-card"
import { ExcelImportDialog } from "@/components/teacher/quiz/excel-import-dialog"
import { UpdateQuizDialog } from "@/components/teacher/quiz/update-quiz-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WorkspacePanel } from "@/components/workspace/workspace-page"
import { ArrowLeft, FileQuestion, ListChecks, Plus, Shuffle } from "lucide-react"

interface QuizEditorClientProps {
    quiz: {
        id: string
        title: string
        description?: string | null
        randomizeChoices: boolean
        questions: QuizEditorQuestion[]
    }
}

export function QuizEditorClient({ quiz }: QuizEditorClientProps) {
    const [isAddingNew, setIsAddingNew] = useState(false)
    const newQuestionRef = useRef<HTMLDivElement>(null)
    const questions = quiz.questions || []
    const totalPoints = questions.reduce((sum, question) => sum + (question.points || 0), 0)

    useEffect(() => {
        if (isAddingNew) newQuestionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, [isAddingNew])

    function startAddingQuestion() {
        setIsAddingNew(true)
    }

    return (
        <div className="space-y-4">
            <WorkspacePanel className="grid grid-cols-2 overflow-hidden md:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
                <div className="flex items-center gap-2 border-b border-r px-3 py-2.5 md:border-b-0">
                    <FileQuestion className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">Questions</p>
                        <p className="text-sm font-semibold tabular-nums">{questions.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 border-b px-3 py-2.5 md:border-b-0 md:border-r">
                    <ListChecks className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">Total points</p>
                        <p className="text-sm font-semibold tabular-nums">{totalPoints}</p>
                    </div>
                </div>
                <div className="col-span-2 flex items-center gap-2 border-r px-3 py-2.5 md:col-span-1">
                    <Shuffle className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">Choice order</p>
                        <p className="truncate text-sm font-semibold">{quiz.randomizeChoices ? "Shuffled" : "As written"}</p>
                    </div>
                </div>
                <div className="col-span-2 flex flex-wrap items-center justify-end gap-2 border-t p-2 md:col-span-1 md:border-l md:border-t-0">
                    <Button variant="outline" size="sm" asChild className="hidden lg:inline-flex">
                        <Link href="/teacher/quiz-manager"><ArrowLeft className="size-4" />Library</Link>
                    </Button>
                    <UpdateQuizDialog quiz={quiz} trigger="button" />
                </div>
            </WorkspacePanel>

            {quiz.description && (
                <p className="max-w-[90ch] text-sm leading-6 text-muted-foreground">{quiz.description}</p>
            )}

            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_15rem]">
                <main className="min-w-0 space-y-3">
                    <div className="flex flex-col gap-3 rounded-md border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold">Quiz questions</h2>
                            <p className="text-xs text-muted-foreground">Mark every correct answer, then save each question.</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <ExcelImportDialog quizId={quiz.id} />
                            <Button size="sm" onClick={startAddingQuestion} disabled={isAddingNew}>
                                <Plus className="size-4" />Add question
                            </Button>
                        </div>
                    </div>

                    {questions.length === 0 && !isAddingNew && (
                        <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 px-6 text-center">
                            <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary"><FileQuestion className="size-5" /></div>
                            <h3 className="text-sm font-semibold">Add your first question</h3>
                            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Create it manually or import a prepared spreadsheet.</p>
                            <Button size="sm" className="mt-4" onClick={startAddingQuestion}><Plus className="size-4" />Add question</Button>
                        </div>
                    )}

                    {questions.map((question, index) => (
                        <div id={`question-${index + 1}`} key={question.id} className="scroll-mt-3">
                            <QuestionCard quizId={quiz.id} question={question} questionNumber={index + 1} />
                        </div>
                    ))}

                    {isAddingNew && (
                        <div ref={newQuestionRef} id="new-question" className="scroll-mt-3">
                            <QuestionCard quizId={quiz.id} questionNumber={questions.length + 1} onCancelNew={() => setIsAddingNew(false)} />
                        </div>
                    )}

                    {!isAddingNew && questions.length > 0 && (
                        <button type="button" onClick={startAddingQuestion} className="flex min-h-20 w-full items-center justify-center gap-2 rounded-md border border-dashed bg-muted/10 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
                            <Plus className="size-4" />Add another question
                        </button>
                    )}
                </main>

                <aside className="sticky top-0 hidden rounded-md border bg-card p-3 xl:block" aria-label="Question outline">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <h2 className="text-sm font-semibold">Outline</h2>
                        <Badge variant="secondary">{questions.length}</Badge>
                    </div>
                    <nav className="max-h-[calc(100vh-14rem)] space-y-1 overflow-y-auto">
                        {questions.map((question, index) => (
                            <a key={question.id} href={`#question-${index + 1}`} className="flex items-start gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted font-semibold tabular-nums text-foreground">{index + 1}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="line-clamp-2 leading-4">{question.text || "Untitled question"}</span>
                                    <span className="mt-0.5 block text-[10px]">{question.points || 0} pts · {question.choices?.length || 0} choices</span>
                                </span>
                            </a>
                        ))}
                        {isAddingNew && <a href="#new-question" className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-2 text-xs font-medium text-primary"><Plus className="size-4" />New question</a>}
                    </nav>
                </aside>
            </div>
        </div>
    )
}
