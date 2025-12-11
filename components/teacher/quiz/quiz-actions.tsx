"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit2 } from "lucide-react"
import Link from "next/link"
import { DeleteQuizButton } from "./delete-quiz-button"
import { UpdateQuizDialog } from "./update-quiz-dialog"
import { RestoreQuizButton } from "./restore-quiz-button"
import { useState } from "react"

interface QuizActionsProps {
    quiz: {
        id: string
        title: string
        description?: string | null
        deletedAt?: Date | null
    }
}

export function QuizActions({ quiz }: QuizActionsProps) {
    const [open, setOpen] = useState(false)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <UpdateQuizDialog quiz={quiz} />
                </DropdownMenuItem>
                <DeleteQuizButton quizId={quiz.id} />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
