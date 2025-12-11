"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import { getStudentQuiz } from "@/lib/actions/quiz.actions"
import { submitQuizAttempt } from "@/lib/actions/student.actions"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface QuizPlayerProps {
    quizId: string
    assignmentId: string
    initialAnswers?: Record<string, string> // If review mode
    isReadOnly?: boolean
    showGradeAfterSubmission?: boolean
}

interface Question {
    id: string
    text: string
    imageUrl?: string
    choices: Choice[]
    order: number
}

interface Choice {
    id: string
    text: string
    imageUrl?: string
    order: number
}

export function QuizPlayer({ quizId, assignmentId, initialAnswers, isReadOnly = false, showGradeAfterSubmission = true }: QuizPlayerProps) {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers || {})
    const [currentStep, setCurrentStep] = useState(0)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    useEffect(() => {
        async function loadQuiz() {
            setLoading(true)
            const res = await getStudentQuiz(quizId)
            if (res.quiz) {
                setQuestions(res.quiz.questions as any)
            } else {
                toast.error(res.error || "Failed to load quiz")
            }
            setLoading(false)
        }
        loadQuiz()
    }, [quizId])

    const handleAnswer = (questionId: string, choiceId: string) => {
        if (isReadOnly) return
        setAnswers(prev => ({ ...prev, [questionId]: choiceId }))
    }

    const handleSubmit = () => {
        // Check if all questions answered?
        const unanswered = questions.filter(q => !answers[q.id])
        if (unanswered.length > 0) {
            toast.warning(`You have ${unanswered.length} unanswered questions.`)
            if (!confirm("You have unanswered questions. Are you sure you want to submit?")) {
                return
            }
        }

        startTransition(async () => {
            const res = await submitQuizAttempt(assignmentId, answers)
            if (res.success) {
                if (showGradeAfterSubmission) {
                    toast.success(`Quiz submitted! Grade: ${res.grade}`)
                } else {
                    toast.success("Quiz submitted successfully!")
                }
                router.refresh()
            } else {
                toast.error(res.error || "Failed to submit quiz")
            }
        })
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (questions.length === 0) {
        return <div className="text-center p-8">No questions in this quiz.</div>
    }

    const currentQuestion = questions[currentStep]
    const isLastQuestion = currentStep === questions.length - 1

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Progress / Step Indicator */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>Question {currentStep + 1} of {questions.length}</span>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    {/* Question */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium leading-relaxed">
                            {currentQuestion.text}
                        </h3>
                        {currentQuestion.imageUrl && (
                            <div className="w-full rounded-md overflow-hidden bg-muted border">
                                <Image
                                    src={currentQuestion.imageUrl}
                                    alt="Question Image"
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="w-full h-auto"
                                    priority
                                />
                            </div>
                        )}
                    </div>

                    {/* Choices */}
                    <RadioGroup
                        value={answers[currentQuestion.id] || ""}
                        onValueChange={(val) => handleAnswer(currentQuestion.id, val)}
                        disabled={isReadOnly}
                        className="space-y-3"
                    >
                        {currentQuestion.choices.map((choice) => {
                            const hasImage = !!choice.imageUrl
                            return (
                                <div
                                    key={choice.id}
                                    onClick={() => handleAnswer(currentQuestion.id, choice.id)}
                                    className={cn(
                                        "flex space-x-3 space-y-0 rounded-md border p-4 transition-all cursor-pointer",
                                        answers[currentQuestion.id] === choice.id
                                            ? 'bg-primary/10 border-primary ring-2 ring-primary ring-offset-2'
                                            : 'hover:bg-muted/50 border-input',
                                        hasImage ? "items-start" : "items-center"
                                    )}
                                >
                                    <RadioGroupItem
                                        value={choice.id}
                                        id={choice.id}
                                        className="sr-only" // Hide the actual radio button visually
                                    />
                                    <Label htmlFor={choice.id} className="flex-1 cursor-pointer font-normal grid gap-2 pointer-events-none">
                                        <span className="leading-normal font-medium">{choice.text}</span>
                                        {choice.imageUrl && (
                                            <div className="relative w-full aspect-video rounded-sm overflow-hidden border">
                                                <Image
                                                    src={choice.imageUrl}
                                                    alt="Choice Image"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                    </Label>
                                </div>
                            )
                        })}
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0 || isPending}
                >
                    Previous
                </Button>

                {isLastQuestion ? (
                    !isReadOnly ? (
                        <Button onClick={handleSubmit} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Quiz
                        </Button>
                    ) : (
                        <div className="text-sm text-muted-foreground flex items-center">
                            Quiz Completed
                        </div>
                    )
                ) : (
                    <Button onClick={() => setCurrentStep(prev => Math.min(questions.length - 1, prev + 1))}>
                        Next
                    </Button>
                )}
            </div>

            {/* Quick Navigation (Optional) */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentStep(idx)}
                        className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition-colors ${idx === currentStep
                            ? 'bg-primary text-primary-foreground'
                            : answers[questions[idx].id]
                                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
        </div>
    )
}
