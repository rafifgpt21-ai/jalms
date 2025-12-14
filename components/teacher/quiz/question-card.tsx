"use client"

import { useState, useEffect } from "react"
import { useTransition } from "react"
import { useLocalUpload } from "@/hooks/use-local-upload"
import { upsertQuestion, deleteQuestion, deleteQuizImages } from "@/lib/actions/quiz.actions"
import { Card, CardContent, CardFooter, CardHeader, CardTitle as CardTitleUI } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, Image as ImageIcon, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
import { AudioLines, Play } from "lucide-react"

interface Choice {
    id?: string
    text: string
    imageUrl?: string
    isCorrect: boolean
    order: number
}

interface QuestionProps {
    quizId: string
    question?: any // Type properly if possible
    onCancelNew?: () => void
}

export function QuestionCard({ quizId, question, onCancelNew }: QuestionProps) {
    const isNew = !question
    const [text, setText] = useState(question?.text || "")
    const [imageUrl, setImageUrl] = useState<string | undefined>(question?.imageUrl || undefined)
    const [choices, setChoices] = useState<Choice[]>(question?.choices || [
        { text: "", isCorrect: false, order: 0 },
        { text: "", isCorrect: false, order: 1 }
    ])
    const [audioUrl, setAudioUrl] = useState<string | undefined>(question?.audioUrl || undefined)
    const [audioLimit, setAudioLimit] = useState<number>(question?.audioLimit || 0)

    // Lazy Upload State
    const [pendingQuestionFile, setPendingQuestionFile] = useState<File | null>(null)
    const [pendingAudioFile, setPendingAudioFile] = useState<File | null>(null)
    const [pendingChoiceFiles, setPendingChoiceFiles] = useState<Record<number, File>>({})
    const [objectUrls, setObjectUrls] = useState<string[]>([]) // Track for cleanup

    const [isPending, startTransition] = useTransition()
    const { startUpload, isUploading } = useLocalUpload()
    const router = useRouter()
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url))
        }
    }, [objectUrls])

    const createPreview = (file: File) => {
        const url = URL.createObjectURL(file)
        setObjectUrls(prev => [...prev, url])
        return url
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'question' | 'audio' | number) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        const file = files[0]

        if (target === 'question') {
            setPendingQuestionFile(file)
        } else if (target === 'audio') {
            setPendingAudioFile(file)
        } else {
            setPendingChoiceFiles(prev => ({ ...prev, [target]: file }))
        }
    }

    const removeImage = (target: 'question' | 'audio' | number) => {
        if (target === 'question') {
            setPendingQuestionFile(null)
            setImageUrl(undefined)
        } else if (target === 'audio') {
            setPendingAudioFile(null)
            setAudioUrl(undefined)
        } else {
            const newChoices = [...choices]
            newChoices[target as number].imageUrl = undefined
            setChoices(newChoices)
            setPendingChoiceFiles(prev => {
                const next = { ...prev }
                delete next[target as number]
                return next
            })
        }
    }

    const updateChoice = (index: number, field: keyof Choice, value: any) => {
        const newChoices = [...choices]
        newChoices[index] = { ...newChoices[index], [field]: value }

        if (field === 'isCorrect' && value === true) {
            newChoices.forEach((c, i) => {
                if (i !== index) c.isCorrect = false
            })
        }

        setChoices(newChoices)
    }

    const addChoice = () => {
        if (choices.length >= 6) return
        setChoices([...choices, { text: "", isCorrect: false, order: choices.length }])
    }

    const removeChoice = (index: number) => {
        if (choices.length <= 2) {
            toast.error("Minimum 2 choices required")
            return
        }

        // When removing a choice, ensure we also cleanup pending files for it
        // However, indices shift. This is tricky with index-based keys.
        // It's better to use unique IDs for keys in pendingChoiceFiles if possible, but choices don't always have IDs.
        // Simplified approach: Clear all pending choice uploads if we remove a choice to prevent index mismatch? 
        // Or just warn user? 
        // Correct approach: Map old indices to new indices. 
        // For this task, let's keep it simple: If you remove a choice, we remove its pending file. 
        // For subsequent choices, we need to shift their keys in pendingChoiceFiles.

        const newPending = { ...pendingChoiceFiles }
        delete newPending[index]
        // Shift keys > index down by 1
        Object.keys(newPending).forEach(key => {
            const k = parseInt(key)
            if (k > index) {
                newPending[k - 1] = newPending[k]
                delete newPending[k]
            }
        })
        setPendingChoiceFiles(newPending)



        const newChoices = choices.filter((_, i) => i !== index).map((c, i) => ({ ...c, order: i }))
        setChoices(newChoices)
    }

    const handleSave = async () => {
        if (!text.trim()) {
            toast.error("Question text is required")
            return
        }
        if (choices.length < 2) {
            toast.error("At least 2 choices are required")
            return
        }
        if (!choices.some(c => c.isCorrect)) {
            toast.error("Please mark one choice as correct")
            return
        }
        if (choices.some(c => !c.text.trim() && !c.imageUrl && !pendingChoiceFiles[c.order])) {
            // Note: need to check if pending file exists for that index too
            toast.error("All choices must have text or an image")
            return
        }

        startTransition(async () => {
            // 1. Upload Images
            let finalQuestionImageUrl = imageUrl
            const finalChoices = [...choices]
            const imagesToDelete: string[] = []

            // Question Image
            if (pendingQuestionFile) {
                const uploaded = await startUpload([pendingQuestionFile], "quiz-pictures")
                if (uploaded?.[0]) {
                    finalQuestionImageUrl = uploaded[0].url
                    // Check if we replaced an existing image
                    if (question?.imageUrl && question.imageUrl !== finalQuestionImageUrl) {
                        imagesToDelete.push(question.imageUrl)
                    }
                }
                imagesToDelete.push(question.imageUrl)
            }

            // Audio Upload
            let finalAudioUrl = audioUrl
            if (pendingAudioFile) {
                const uploaded = await startUpload([pendingAudioFile], "quiz-audio")
                if (uploaded?.[0]) {
                    finalAudioUrl = uploaded[0].url
                    if (question?.audioUrl && question.audioUrl !== finalAudioUrl) {
                        imagesToDelete.push(question.audioUrl)
                    }
                }
            } else if (question?.audioUrl && !audioUrl) {
                // Audio was removed
                imagesToDelete.push(question.audioUrl)
            }

            // Choice Images
            // Parallel upload? sequential for now to keep it simple with hook
            for (let i = 0; i < finalChoices.length; i++) {
                const pendingFile = pendingChoiceFiles[i]
                const originalChoice = question?.choices?.[i] // This matching by index assumes order preserved. 
                // Wait, if we added/removed choices, matching by index to original question.choices is risky if IDs not aligned.
                // But for deletion logic: 
                // If original choice had URL, and now we track it by ID?

                // Better deletion logic:
                // Collect ALL original URLs from `question`. 
                // Collect ALL final URLs we are about to save.
                // Any original URL not in final set should be deleted.
                // This handles reordering, deletion, replacement automatically.

                if (pendingFile) {
                    const uploaded = await startUpload([pendingFile], "quiz-pictures")
                    if (uploaded?.[0]) {
                        finalChoices[i].imageUrl = uploaded[0].url
                    }
                }
            }

            // Calculate images to delete (Global diff approach)
            const oldUrls = new Set<string>()
            if (question?.imageUrl) oldUrls.add(question.imageUrl)
            if (question?.audioUrl) oldUrls.add(question.audioUrl)

            question?.choices?.forEach((c: any) => {
                if (c.imageUrl) oldUrls.add(c.imageUrl)
            })

            const newUrls = new Set<string>()
            if (finalQuestionImageUrl) newUrls.add(finalQuestionImageUrl)
            if (finalAudioUrl) newUrls.add(finalAudioUrl)
            finalChoices.forEach(c => {
                if (c.imageUrl) newUrls.add(c.imageUrl)
            })

            const toDelete = Array.from(oldUrls).filter(url => !newUrls.has(url))

            if (toDelete.length > 0) {
                await deleteQuizImages(toDelete)
            }

            const questionData = {
                id: question?.id,
                text,
                imageUrl: finalQuestionImageUrl,
                audioUrl: finalAudioUrl,
                audioLimit: audioLimit,
                order: question?.order || 0,
                choices: finalChoices.map((c, i) => ({ ...c, order: i }))
            }

            const result = await upsertQuestion(quizId, questionData as any)
            if ('error' in result && result.error) {
                toast.error(result.error)
            } else {
                toast.success(isNew ? "Question added" : "Question updated")
                if (isNew && onCancelNew) onCancelNew()
                router.refresh()
            }
        })
    }

    const getDisplayQuestionUrl = () => {
        if (pendingQuestionFile) return URL.createObjectURL(pendingQuestionFile)
        return imageUrl
    }

    const getDisplayAudioUrl = () => {
        if (pendingAudioFile) return URL.createObjectURL(pendingAudioFile)
        return audioUrl
    }

    const getDisplayChoiceUrl = (index: number) => {
        if (pendingChoiceFiles[index]) return URL.createObjectURL(pendingChoiceFiles[index])
        return choices[index].imageUrl
    }

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteQuestion(question.id)
            if ('error' in result && result.error) {
                toast.error(result.error)
            } else {
                toast.success("Question deleted")
                setIsDeleteOpen(false)
                router.refresh()
            }
        })
    }

    return (
        <Card className="relative overflow-hidden">
            {(isPending || isUploading) && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
            <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <Label>Question</Label>
                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter your question here..."
                                className="resize-none"
                            />
                        </div>

                        {getDisplayQuestionUrl() ? (
                            <div className="relative w-full max-w-sm aspect-video rounded-md overflow-hidden border bg-muted">
                                <Image
                                    src={getDisplayQuestionUrl()!}
                                    alt="Question Image"
                                    fill
                                    className="object-contain"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => removeImage('question')}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Label htmlFor={`q-img-${question?.id || 'new'}`} style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white/50 dark:bg-slate-900/50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Add Image
                                </Label>
                                <Input
                                    id={`q-img-${question?.id || 'new'}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageSelect(e, 'question')}
                                    disabled={isUploading}
                                />
                            </div>
                        )}

                        {/* Audio Upload Section */}
                        <div className="space-y-2">
                            <Label>Audio (Optional)</Label>
                            {getDisplayAudioUrl() ? (
                                <div className="flex items-center gap-4 p-3 border rounded-md bg-muted/50">
                                    <div className="flex-1 flex gap-3 items-center">
                                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                            <AudioLines className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium line-clamp-1">
                                                {pendingAudioFile ? pendingAudioFile.name : "Audio Attachment"}
                                            </p>
                                            <audio controls className="h-8 w-full" src={getDisplayAudioUrl()!} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 border-l pl-3">
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor={`audio-limit-${question?.id || 'new'}`} className="text-xs text-muted-foreground">
                                                Max Plays (0=∞)
                                            </Label>
                                            <Input
                                                id={`audio-limit-${question?.id || 'new'}`}
                                                type="number"
                                                min="0"
                                                value={audioLimit}
                                                onChange={(e) => setAudioLimit(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="h-7 w-20 text-center"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeImage('audio')}
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`q-audio-${question?.id || 'new'}`} style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white/50 dark:bg-slate-900/50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                                        <AudioLines className="mr-2 h-4 w-4" />
                                        Attach Audio
                                    </Label>
                                    <Input
                                        id={`q-audio-${question?.id || 'new'}`}
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        onChange={(e) => handleImageSelect(e, 'audio')}
                                        disabled={isUploading}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {!isNew && (
                        <div className="flex flex-col gap-2">
                            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete this question and its associated images.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <Button variant="ghost" size="icon"
                                onClick={() => setIsDeleteOpen(true)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader >
            <CardContent>
                <div className="space-y-4">
                    <Label>Choices</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {choices.map((choice, index) => (
                            <div key={index} className={`flex flex-col gap-2 p-3 rounded-md border ${choice.isCorrect ? 'border-green-500 bg-green-50/20' : 'border-border'}`}>
                                <div className="flex items-start gap-2">
                                    <div className="pt-2">
                                        <div
                                            className={`h-4 w-4 rounded-full border border-primary cursor-pointer ${choice.isCorrect ? 'bg-primary' : 'bg-transparent'}`}
                                            onClick={() => updateChoice(index, 'isCorrect', true)}
                                            title="Mark as correct answer"
                                        >
                                            {choice.isCorrect && <div className="h-full w-full rounded-full bg-white scale-[0.4]" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={choice.text}
                                            onChange={(e) => updateChoice(index, 'text', e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        {getDisplayChoiceUrl(index) ? (
                                            <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-muted">
                                                <Image
                                                    src={getDisplayChoiceUrl(index)!}
                                                    alt={`Choice ${index + 1}`}
                                                    fill
                                                    className="object-contain"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-5 w-5"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <Label htmlFor={`c-img-${index}-${question?.id || 'new'}`} className="cursor-pointer text-xs flex items-center text-muted-foreground hover:text-foreground">
                                                    <ImageIcon className="mr-1 h-3 w-3" />
                                                    Add Image
                                                </Label>
                                                <Input
                                                    id={`c-img-${index}-${question?.id || 'new'}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageSelect(e, index)}
                                                    disabled={isUploading}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeChoice(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {choices.length < 6 && (
                            <Button variant="outline" className="h-full min-h-[100px] border-dashed" onClick={addChoice}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Choice
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2 bg-muted/20 py-3">
                {isNew && (
                    <Button variant="ghost" onClick={onCancelNew}>Cancel</Button>
                )}
                <Button onClick={handleSave} disabled={isPending || isUploading}>
                    {isPending || isUploading ? "Saving..." : "Save Question"}
                </Button>
            </CardFooter>
        </Card >
    )
}
