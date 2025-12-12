"use client"

import { useState, useTransition, useEffect, useRef } from "react"
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
    audioUrl?: string
    audioLimit?: number
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

    return (
        <div className="space-y-8 max-w-3xl mx-auto pb-12">
            <div className="space-y-6">
                {questions.map((question, index) => (
                    <Card key={question.id} className="overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                            {/* Question Header */}
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <span className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <h3 className="text-lg font-medium leading-relaxed pt-0.5">
                                        {question.text}
                                    </h3>
                                    {question.imageUrl && (
                                        <div className="w-full rounded-md overflow-hidden bg-muted border">
                                            <Image
                                                src={question.imageUrl}
                                                alt="Question Image"
                                                width={0}
                                                height={0}
                                                sizes="100vw"
                                                className="w-full h-auto"
                                                priority={index < 2}
                                            />
                                        </div>
                                    )}
                                    {question.audioUrl && (
                                        <div className="w-full p-4 rounded-md bg-muted border border-border/50">
                                            <AudioPlayer
                                                src={question.audioUrl}
                                                limit={question.audioLimit || 0}
                                                quizId={quizId}
                                                questionId={question.id}
                                                isReadOnly={isReadOnly}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Choices */}
                            < RadioGroup
                                value={answers[question.id] || ""}
                                onValueChange={(val) => handleAnswer(question.id, val)}
                                disabled={isReadOnly}
                                className="space-y-3 pl-11"
                            >
                                {question.choices.map((choice) => {
                                    const hasImage = !!choice.imageUrl
                                    return (
                                        <div
                                            key={choice.id}
                                            onClick={() => handleAnswer(question.id, choice.id)}
                                            className={cn(
                                                "flex space-x-3 space-y-0 rounded-md border p-4 transition-all cursor-pointer",
                                                answers[question.id] === choice.id
                                                    ? 'bg-primary/10 border-primary ring-2 ring-primary ring-offset-2'
                                                    : 'hover:bg-muted/50 border-input',
                                                hasImage ? "items-start" : "items-center"
                                            )}
                                        >
                                            <RadioGroupItem
                                                value={choice.id}
                                                id={choice.id}
                                                className="sr-only"
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
                ))}
            </div>

            {/* Submit Action */}
            < div className="flex justify-end pt-6 border-t mt-4" >
                {!isReadOnly ? (
                    <Button onClick={handleSubmit} disabled={isPending} size="lg" className="w-full sm:w-auto min-w-[200px]">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Quiz
                    </Button>
                ) : (
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted px-4 py-2 rounded-md">
                        <CheckCircle className="h-5 w-5" />
                        <span>Quiz Completed</span>
                    </div>
                )}
            </div >
        </div >
    )
}

function AudioPlayer({ src, limit, quizId, questionId, isReadOnly }: { src: string, limit: number, quizId: string, questionId: string, isReadOnly: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [plays, setPlays] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasEnded, setHasEnded] = useState(false)

    // Key for local storage
    const storageKey = `quiz-audio-${quizId}-${questionId}-plays`

    useEffect(() => {
        // Load plays from local storage
        if (typeof window !== 'undefined') {
            const savedPlays = parseInt(localStorage.getItem(storageKey) || '0')
            setPlays(savedPlays)
        }
    }, [storageKey])

    const handlePlay = () => {
        if (limit > 0 && plays >= limit) {
            toast.error("Maximum play limit reached.")
            return
        }

        // If not already playing, increment count
        // Note: 'playing' event fires when media is no longer paused. 
        // We want to count 'starts'. 
    }

    const onPlayStart = () => {
        if (limit > 0 && plays >= limit) {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
            return
        }

        // Increment count if just starting (currentTime near 0) or seemingly a new play session
        // A simple approach: Increment when 'play' is clicked.
        // But the native control fires 'play' event.

        // Let's rely on a custom wrapper if we wantstrict control, but native <audio> is requested.
        // We can just listen to 'ended' to accept it as a 'full play'?
        // Or listen to 'play' event.

        // Requirement: "can only be play 1 time". Usually that means 'start' or 'finish'? 
        // Let's assume 'start' to prevent abuse (repeatedly replaying first 5 seconds).

        // To avoid double counting on auto-resume or seeking:
        // We can check if it was paused ? 

        // Simple robust logic: Increment on 'play' event, sync to localStorage immediately.
    }

    const handleNativePlay = () => {
        // Check limit before allowing
        if (limit > 0 && plays >= limit) {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0 // Reset
            }
            toast.error("Maximum playback limit reached")
            return
        }

        // Verify if we should count this as a play. 
        // If we just seeked, 'play' might fire? 
        // Native controls are tricky. 

        // Let's use a simpler "Click to Play" overlay if we want to enforce strictly?
        // Or just let it loose: Each time 'play' is hit, it counts. 
        // Warning: Pausing and Resuming counts as 2 plays? That's bad.
        // Solution: Only count if currentTime is 0 or very close? 
        // Or track 'hasStarted' state for this session?

        if (!isPlaying) {
            // It was paused/stopped. Now starting.
            // If we are resuming from middle, should it count? 
            // "Play 1 time" usually means "Listen to the whole thing once".
            // If they pause in middle, they should be able to resume.
            // So we only count if (plays < limit) AND (we are at start OR we haven't tracked a play this session yet?)

            // Better: Count when it ENDS? No, then they can refresh page.
            // Count when START? Yes.

            // Logic: If (currentTime < 0.5), increment plays. 
            // Else, it's a resume? 

            if (audioRef.current && audioRef.current.currentTime < 1) {
                const newPlays = plays + 1
                setPlays(newPlays)
                localStorage.setItem(storageKey, newPlays.toString())
            }
        }
        setIsPlaying(true)
    }

    const handlePause = () => {
        setIsPlaying(false)
    }

    const handleEnded = () => {
        setIsPlaying(false)
        setHasEnded(true)
    }

    const remaining = limit > 0 ? Math.max(0, limit - plays) : Infinity

    return (
        <div className="flex flex-col gap-2">
            <audio
                ref={audioRef}
                controls
                className="w-full"
                src={src}
                onPlay={handleNativePlay}
                onPause={handlePause}
                onEnded={handleEnded}
                controlsList={limit > 0 ? "nodownload" : undefined} // try to prevent download if limited
            />
            {limit > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>
                        {remaining === 0 ? (
                            <span className="text-destructive font-medium flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> Limit reached
                            </span>
                        ) : (
                            <span>{remaining} plays remaining</span>
                        )}
                    </span>
                    {limit > 0 && remaining > 0 && (
                        <span className="italic">Note: Resuming counts as a play if restarted</span>
                    )}
                </div>
            )}
        </div>
    )
}
