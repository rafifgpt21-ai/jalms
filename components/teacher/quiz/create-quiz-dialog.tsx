"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createQuiz } from "@/lib/actions/quiz.actions"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

export function CreateQuizDialog() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        startTransition(async () => {
            const result = await createQuiz(title, description)
            if (result.error) {
                toast.error(result.error)
            } else if (result.quiz) {
                toast.success("Quiz created successfully")
                setOpen(false)
                setTitle("")
                setDescription("")
                router.push(`/teacher/quiz-manager/${result.quiz.id}`)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Quiz
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Quiz</DialogTitle>
                        <DialogDescription>
                            Give your quiz a title and optional description to get started.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. Chapter 1 Review"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                                placeholder="Optional description..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || !title.trim()}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Quiz
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
