"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import imageCompression from "browser-image-compression"
import { AudioLines, Image as ImageIcon, Loader2, Plus, Save, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { useLocalUpload } from "@/hooks/use-local-upload"
import { deleteQuestion, deleteQuizImages, upsertQuestion } from "@/lib/actions/quiz.actions"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export interface QuizEditorChoice {
    id?: string
    text: string
    imageUrl?: string | null
    isCorrect: boolean
    order: number
}

export interface QuizEditorQuestion {
    id: string
    text: string
    imageUrl?: string | null
    audioUrl?: string | null
    audioLimit: number
    points: number
    gradingType: "ALL_OR_NOTHING" | "RIGHT_MINUS_WRONG"
    explanation?: string | null
    order: number
    choices: QuizEditorChoice[]
}

type Choice = QuizEditorChoice

interface QuestionProps {
    quizId: string
    question?: QuizEditorQuestion
    onCancelNew?: () => void
    questionNumber?: number
}

export function QuestionCard({ quizId, question, onCancelNew, questionNumber }: QuestionProps) {
    const isNew = !question
    const router = useRouter()
    const { startUpload, isUploading } = useLocalUpload()
    const [isPending, startTransition] = useTransition()

    const [text, setText] = useState(question?.text || "")
    const [imageUrl, setImageUrl] = useState<string | undefined>(question?.imageUrl || undefined)
    const [audioUrl, setAudioUrl] = useState<string | undefined>(question?.audioUrl || undefined)
    const [audioLimit, setAudioLimit] = useState<number>(question?.audioLimit || 0)
    const [points, setPoints] = useState<number>(question?.points ?? 1)
    const [gradingType, setGradingType] = useState<"ALL_OR_NOTHING" | "RIGHT_MINUS_WRONG">(question?.gradingType || "ALL_OR_NOTHING")
    const [explanation, setExplanation] = useState<string>(question?.explanation || "")
    const [choices, setChoices] = useState<Choice[]>(question?.choices || [
        { text: "", isCorrect: false, order: 0 },
        { text: "", isCorrect: false, order: 1 },
    ])

    const [pendingQuestionFile, setPendingQuestionFile] = useState<File | null>(null)
    const [pendingAudioFile, setPendingAudioFile] = useState<File | null>(null)
    const [pendingChoiceFiles, setPendingChoiceFiles] = useState<Record<number, File>>({})
    const [questionPreview, setQuestionPreview] = useState<string | undefined>(imageUrl)
    const [audioPreview, setAudioPreview] = useState<string | undefined>(audioUrl)
    const [choicePreviews, setChoicePreviews] = useState<Record<number, string>>(() =>
        Object.fromEntries((question?.choices || []).flatMap((choice, index) => choice.imageUrl ? [[index, choice.imageUrl] as const] : [])),
    )
    const localPreviewUrls = useRef<string[]>([])
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    useEffect(() => {
        const urls = localPreviewUrls.current
        return () => urls.forEach((url) => URL.revokeObjectURL(url))
    }, [])

    function createPreview(file: File) {
        const url = URL.createObjectURL(file)
        localPreviewUrls.current.push(url)
        return url
    }

    async function compressFile(file: File) {
        if (!file.type.startsWith("image/")) return file
        try {
            toast.info("Optimizing image…", { duration: 1000 })
            return await imageCompression(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: "image/webp",
                initialQuality: 0.8,
            })
        } catch (error) {
            console.error("Image compression failed:", error)
            return file
        }
    }

    async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>, target: "question" | "audio" | number) {
        const selected = event.target.files?.[0]
        if (!selected) return

        if (target === "audio") {
            if (selected.size > 1024 * 1024) {
                toast.error("Audio must be smaller than 1 MB")
                event.target.value = ""
                return
            }
            setPendingAudioFile(selected)
            setAudioPreview(createPreview(selected))
            return
        }

        const file = await compressFile(selected)
        if (target === "question") {
            setPendingQuestionFile(file)
            setQuestionPreview(createPreview(file))
        } else {
            setPendingChoiceFiles((current) => ({ ...current, [target]: file }))
            setChoicePreviews((current) => ({ ...current, [target]: createPreview(file) }))
        }
    }

    function removeMedia(target: "question" | "audio" | number) {
        if (target === "question") {
            setPendingQuestionFile(null)
            setImageUrl(undefined)
            setQuestionPreview(undefined)
            return
        }
        if (target === "audio") {
            setPendingAudioFile(null)
            setAudioUrl(undefined)
            setAudioPreview(undefined)
            return
        }

        setChoices((current) => current.map((choice, index) => index === target ? { ...choice, imageUrl: undefined } : choice))
        setPendingChoiceFiles((current) => {
            const next = { ...current }
            delete next[target]
            return next
        })
        setChoicePreviews((current) => {
            const next = { ...current }
            delete next[target]
            return next
        })
    }

    function updateChoice(index: number, field: keyof Choice, value: string | boolean) {
        setChoices((current) => current.map((choice, choiceIndex) => choiceIndex === index ? { ...choice, [field]: value } : choice))
    }

    function addChoice() {
        if (choices.length >= 6) return
        setChoices((current) => [...current, { text: "", isCorrect: false, order: current.length }])
    }

    function removeChoice(index: number) {
        if (choices.length <= 2) {
            toast.error("A question needs at least two choices")
            return
        }

        setChoices((current) => current.filter((_, choiceIndex) => choiceIndex !== index).map((choice, choiceIndex) => ({ ...choice, order: choiceIndex })))
        setPendingChoiceFiles((current) => shiftIndexedRecord(current, index))
        setChoicePreviews((current) => shiftIndexedRecord(current, index))
    }

    function handleSave() {
        if (!text.trim()) return toast.error("Question text is required")
        if (choices.length < 2) return toast.error("Add at least two choices")
        if (!choices.some((choice) => choice.isCorrect)) return toast.error("Mark at least one correct answer")
        if (choices.some((choice, index) => !choice.text.trim() && !choice.imageUrl && !pendingChoiceFiles[index])) {
            return toast.error("Every choice needs text or an image")
        }

        startTransition(async () => {
            let finalQuestionImageUrl = imageUrl
            let finalAudioUrl = audioUrl
            const finalChoices = choices.map((choice) => ({ ...choice }))

            if (pendingQuestionFile) {
                const uploaded = await startUpload([pendingQuestionFile], "quiz-pictures")
                if (uploaded?.[0]) finalQuestionImageUrl = uploaded[0].url
            }
            if (pendingAudioFile) {
                const uploaded = await startUpload([pendingAudioFile], "quiz-audio")
                if (uploaded?.[0]) finalAudioUrl = uploaded[0].url
            }
            for (let index = 0; index < finalChoices.length; index++) {
                const file = pendingChoiceFiles[index]
                if (!file) continue
                const uploaded = await startUpload([file], "quiz-pictures")
                if (uploaded?.[0]) finalChoices[index].imageUrl = uploaded[0].url
            }

            const result = await upsertQuestion(quizId, {
                id: question?.id,
                text: text.trim(),
                imageUrl: finalQuestionImageUrl,
                audioUrl: finalAudioUrl,
                audioLimit,
                order: question?.order ?? 0,
                points,
                gradingType,
                explanation: explanation.trim(),
                choices: finalChoices.map((choice, index) => ({ ...choice, imageUrl: choice.imageUrl || undefined, text: choice.text.trim(), order: index })),
            })

            if ("error" in result && result.error) {
                toast.error(result.error)
                return
            }

            const previousUrls = new Set<string>()
            const nextUrls = new Set<string>()
            if (question?.imageUrl) previousUrls.add(question.imageUrl)
            if (question?.audioUrl) previousUrls.add(question.audioUrl)
            question?.choices?.forEach((choice: Choice) => choice.imageUrl && previousUrls.add(choice.imageUrl))
            if (finalQuestionImageUrl) nextUrls.add(finalQuestionImageUrl)
            if (finalAudioUrl) nextUrls.add(finalAudioUrl)
            finalChoices.forEach((choice) => choice.imageUrl && nextUrls.add(choice.imageUrl))
            const removedUrls = Array.from(previousUrls).filter((url) => !nextUrls.has(url))
            if (removedUrls.length) void deleteQuizImages(removedUrls)

            toast.success(isNew ? "Question added" : "Question updated")
            if (isNew) onCancelNew?.()
            router.refresh()
        })
    }

    function handleDelete() {
        if (!question) return
        startTransition(async () => {
            const result = await deleteQuestion(question.id)
            if ("error" in result && result.error) {
                toast.error(result.error)
                return
            }
            toast.success("Question deleted")
            setIsDeleteOpen(false)
            router.refresh()
        })
    }

    const correctCount = choices.filter((choice) => choice.isCorrect).length
    const busy = isPending || isUploading
    const identity = question?.id || "new"

    return (
        <article className="relative overflow-hidden rounded-md border bg-card shadow-xs" aria-busy={busy}>
            {busy && <div className="absolute inset-x-0 top-0 z-20 h-0.5 animate-pulse bg-primary" />}

            <header className="flex items-center gap-3 border-b bg-muted/25 px-3 py-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold tabular-nums text-primary-foreground">{questionNumber || "+"}</span>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold">{isNew ? "New question" : `Question ${questionNumber || ""}`}</h3>
                    <p className="truncate text-xs text-muted-foreground">{text || "Write the question prompt below."}</p>
                </div>
                <div className="hidden items-center gap-1.5 sm:flex">
                    <Badge variant="secondary">{points} pts</Badge>
                    <Badge variant={correctCount > 0 ? "outline" : "destructive"}>{correctCount} correct</Badge>
                </div>
                {!isNew && (
                    <Button variant="ghost" size="icon-sm" onClick={() => setIsDeleteOpen(true)} className="text-muted-foreground hover:text-destructive" aria-label={`Delete question ${questionNumber || ""}`}>
                        <Trash2 className="size-4" />
                    </Button>
                )}
            </header>

            <div className="space-y-5 p-3 sm:p-4">
                <section className="space-y-3">
                    <div>
                        <Label htmlFor={`question-text-${identity}`}>Question prompt</Label>
                        <p className="mt-0.5 text-xs text-muted-foreground">Keep it direct. Add media only when it helps students answer.</p>
                    </div>
                    <Textarea id={`question-text-${identity}`} value={text} onChange={(event) => setText(event.target.value)} placeholder="What do you want students to answer?" className="min-h-24 resize-y" />

                    <div className="flex flex-wrap gap-2">
                        {!questionPreview && <AttachmentLabel htmlFor={`q-img-${identity}`} icon={ImageIcon} label="Add image" />}
                        <Input id={`q-img-${identity}`} type="file" accept="image/*" className="hidden" onChange={(event) => handleFileSelect(event, "question")} disabled={isUploading} />
                        {!audioPreview && <AttachmentLabel htmlFor={`q-audio-${identity}`} icon={AudioLines} label="Add audio" />}
                        <Input id={`q-audio-${identity}`} type="file" accept="audio/*" className="hidden" onChange={(event) => handleFileSelect(event, "audio")} disabled={isUploading} />
                    </div>

                    {questionPreview && (
                        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border bg-muted">
                            <Image src={questionPreview} alt="Question attachment preview" fill className="object-contain" />
                            <Button variant="destructive" size="icon-sm" className="absolute right-2 top-2" onClick={() => removeMedia("question")} aria-label="Remove question image"><X className="size-4" /></Button>
                        </div>
                    )}

                    {audioPreview && (
                        <div className="grid gap-3 rounded-md border bg-muted/25 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end">
                            <div className="min-w-0">
                                <Label>Audio attachment</Label>
                                <audio controls className="mt-2 h-9 w-full" src={audioPreview} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`audio-limit-${identity}`}>Maximum plays</Label>
                                <Input id={`audio-limit-${identity}`} type="number" min="0" value={audioLimit} onChange={(event) => setAudioLimit(Math.max(0, parseInt(event.target.value) || 0))} />
                                <p className="text-[10px] text-muted-foreground">0 means unlimited</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeMedia("audio")} className="text-muted-foreground hover:text-destructive" aria-label="Remove audio"><X className="size-4" /></Button>
                        </div>
                    )}
                </section>

                <section className="space-y-3 border-t pt-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <Label>Answer choices</Label>
                            <p className="mt-0.5 text-xs text-muted-foreground">Select every correct answer. Two to six choices are supported.</p>
                        </div>
                        {choices.length < 6 && <Button variant="outline" size="sm" onClick={addChoice}><Plus className="size-4" />Add choice</Button>}
                    </div>

                    <div className="grid gap-2 lg:grid-cols-2">
                        {choices.map((choice, index) => (
                            <div key={choice.id || index} className={`rounded-md border p-3 transition-colors ${choice.isCorrect ? "border-emerald-400 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/25" : "bg-background"}`}>
                                <div className="flex items-start gap-2">
                                    <div className="flex min-h-9 items-center gap-2">
                                        <Checkbox id={`correct-${identity}-${index}`} checked={choice.isCorrect} onCheckedChange={(checked) => updateChoice(index, "isCorrect", checked === true)} aria-label={`Mark choice ${index + 1} as correct`} />
                                        <span className="text-xs font-semibold text-muted-foreground">{String.fromCharCode(65 + index)}</span>
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Input value={choice.text} onChange={(event) => updateChoice(index, "text", event.target.value)} placeholder={`Choice ${index + 1}`} aria-label={`Choice ${index + 1} text`} />
                                        {choicePreviews[index] ? (
                                            <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                                                <Image src={choicePreviews[index]} alt={`Choice ${index + 1} attachment preview`} fill className="object-contain" />
                                                <Button variant="destructive" size="icon-sm" className="absolute right-1.5 top-1.5" onClick={() => removeMedia(index)} aria-label={`Remove image from choice ${index + 1}`}><X className="size-4" /></Button>
                                            </div>
                                        ) : <AttachmentLabel htmlFor={`c-img-${index}-${identity}`} icon={ImageIcon} label="Add image" compact />}
                                        <Input id={`c-img-${index}-${identity}`} type="file" accept="image/*" className="hidden" onChange={(event) => handleFileSelect(event, index)} disabled={isUploading} />
                                    </div>
                                    <Button variant="ghost" size="icon-sm" onClick={() => removeChoice(index)} className="text-muted-foreground hover:text-destructive" aria-label={`Remove choice ${index + 1}`}><X className="size-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-3 border-t pt-4 md:grid-cols-[8rem_minmax(0,1fr)]">
                    <div className="space-y-2">
                        <Label htmlFor={`points-${identity}`}>Points</Label>
                        <Input id={`points-${identity}`} type="number" min="1" value={points} onChange={(event) => setPoints(Math.max(1, parseInt(event.target.value) || 1))} />
                    </div>
                    {correctCount > 1 && (
                        <div className="space-y-2">
                            <Label>Multiple-answer grading</Label>
                            <Select value={gradingType} onValueChange={(value) => setGradingType(value as "ALL_OR_NOTHING" | "RIGHT_MINUS_WRONG")}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL_OR_NOTHING">All or nothing</SelectItem>
                                    <SelectItem value="RIGHT_MINUS_WRONG">Partial credit (right minus wrong)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`explanation-${identity}`}>Answer explanation <span className="font-normal text-muted-foreground">(optional)</span></Label>
                        <Textarea id={`explanation-${identity}`} value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="Shown during review when grades are available." className="min-h-20 resize-y" />
                    </div>
                </section>
            </div>

            <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t bg-card/95 px-3 py-2.5 backdrop-blur-sm sm:px-4">
                <p className="hidden text-xs text-muted-foreground sm:block">This question is saved independently.</p>
                <div className="ml-auto flex gap-2">
                    {isNew && <Button variant="ghost" onClick={onCancelNew} disabled={busy}>Cancel</Button>}
                    <Button onClick={handleSave} disabled={busy}>
                        {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        {busy ? "Saving…" : "Save question"}
                    </Button>
                </div>
            </footer>

            {!isNew && (
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete question {questionNumber}?</AlertDialogTitle>
                            <AlertDialogDescription>This permanently removes the question, its choices, and attached media.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Delete question
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </article>
    )
}

function AttachmentLabel({ htmlFor, icon: Icon, label, compact = false }: { htmlFor: string; icon: React.ElementType; label: string; compact?: boolean }) {
    return (
        <Label htmlFor={htmlFor} className={compact
            ? "inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            : "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        }>
            <Icon className={compact ? "size-3" : "size-4"} />{label}
        </Label>
    )
}

function shiftIndexedRecord<T>(record: Record<number, T>, removedIndex: number) {
    const next: Record<number, T> = {}
    Object.entries(record).forEach(([key, value]) => {
        const index = Number(key)
        if (index < removedIndex) next[index] = value
        if (index > removedIndex) next[index - 1] = value
    })
    return next
}
