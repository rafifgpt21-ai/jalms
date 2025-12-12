"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, CheckCircle, XCircle, Play, Pause, Volume2, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { getStudentQuiz } from "@/lib/actions/quiz.actions"
import { submitQuizAttempt } from "@/lib/actions/student.actions"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading Quiz...</p>
            </div>
        )
    }

    if (questions.length === 0) {
        return <div className="text-center p-8 text-slate-500">No questions in this quiz.</div>
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-12">
            {!isReadOnly && (
                <div className="flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                        Zen Mode Active
                    </span>
                    <span className="text-sm text-slate-500">
                        {Object.keys(answers).length} / {questions.length} Answered
                    </span>
                </div>
            )}

            <div className="space-y-16">
                {questions.map((question, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        key={question.id}
                        className="group relative"
                    >
                        {/* Connector Line */}
                        {index !== questions.length - 1 && (
                            <div className="absolute left-[19px] top-12 bottom-[-64px] w-0.5 bg-slate-100 dark:bg-slate-800 -z-10 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors" />
                        )}

                        <div className="flex gap-6">
                            <div className="flex-none">
                                <span className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-sm transition-all duration-300",
                                    answers[question.id]
                                        ? "bg-indigo-600 text-white shadow-indigo-500/30 scale-100"
                                        : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                                )}>
                                    {index + 1}
                                </span>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl md:text-2xl font-heading font-medium text-slate-900 dark:text-white leading-relaxed">
                                        {question.text}
                                    </h3>

                                    {question.imageUrl && (
                                        <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                                            <Image
                                                src={question.imageUrl}
                                                alt="Question"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    {question.audioUrl && (
                                        <div className="w-full max-w-md">
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

                                <RadioGroup
                                    value={answers[question.id] || ""}
                                    onValueChange={(val) => handleAnswer(question.id, val)}
                                    disabled={isReadOnly}
                                    className="space-y-3 pt-2"
                                >
                                    {question.choices.map((choice) => (
                                        <motion.div
                                            whileHover={!isReadOnly ? { scale: 1.01, x: 4 } : {}}
                                            whileTap={!isReadOnly ? { scale: 0.99 } : {}}
                                            key={choice.id}
                                            onClick={() => handleAnswer(question.id, choice.id)}
                                            className={cn(
                                                "relative flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer overflow-hidden backdrop-blur-sm",
                                                answers[question.id] === choice.id
                                                    ? 'bg-indigo-50/80 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800 shadow-sm'
                                                    : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-white/60 dark:hover:bg-slate-900/60'
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none transition-colors",
                                                answers[question.id] === choice.id
                                                    ? "border-indigo-600 dark:border-indigo-400"
                                                    : "border-slate-300 dark:border-slate-600"
                                            )}>
                                                {answers[question.id] === choice.id && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                                )}
                                            </div>

                                            <RadioGroupItem value={choice.id} id={choice.id} className="sr-only" />

                                            <div className="flex-1">
                                                <Label htmlFor={choice.id} className="cursor-pointer text-base font-normal text-slate-700 dark:text-slate-200 block pointer-events-none">
                                                    {choice.text}
                                                </Label>
                                                {choice.imageUrl && (
                                                    <div className="mt-3 relative w-full aspect-video md:w-64 md:aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                                        <Image
                                                            src={choice.imageUrl}
                                                            alt="Choice"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-end pt-12 border-t border-slate-100 dark:border-slate-800">
                {!isReadOnly ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        size="lg"
                        className="w-full sm:w-auto min-w-[240px] h-12 text-lg rounded-xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
                    >
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                        Submit Quiz
                    </Button>
                ) : (
                    <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-6 py-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Quiz Completed</span>
                    </div>
                )}
            </div>
        </div>
    )
}

function AudioPlayer({ src, limit, quizId, questionId, isReadOnly }: { src: string, limit: number, quizId: string, questionId: string, isReadOnly: boolean }) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [plays, setPlays] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    // Key for local storage
    const storageKey = `quiz-audio-${quizId}-${questionId}-plays`

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedPlays = parseInt(localStorage.getItem(storageKey) || '0')
            setPlays(savedPlays)
        }
    }, [storageKey])

    const handleNativePlay = () => {
        if (limit > 0 && plays >= limit) {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
            toast.error("Maximum playback limit reached")
            return
        }

        if (!isPlaying) {
            if (audioRef.current && audioRef.current.currentTime < 1) {
                const newPlays = plays + 1
                setPlays(newPlays)
                localStorage.setItem(storageKey, newPlays.toString())
            }
        }
        setIsPlaying(true)
    }

    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    const remaining = limit > 0 ? Math.max(0, limit - plays) : Infinity

    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Volume2 className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Audio Clip</p>
                    {limit > 0 && (
                        <p className={`text-xs ${remaining === 0 ? "text-red-500" : "text-slate-500"}`}>
                            {remaining === 0 ? "Limit reached" : `${remaining} plays remaining`}
                        </p>
                    )}
                </div>
            </div>

            <audio
                ref={audioRef}
                controls
                className="w-full h-10"
                src={src}
                onPlay={handleNativePlay}
                onPause={handlePause}
                onEnded={handleEnded}
                controlsList={limit > 0 ? "nodownload" : undefined}
            />
        </div>
    )
}
