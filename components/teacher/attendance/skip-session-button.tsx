"use client"

import { Button } from "@/components/ui/button"
import { skipSession, unskipSession } from "@/lib/actions/attendance.actions"
import { Loader2, Ban, Undo2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface SkipSessionButtonProps {
    courseId: string
    date: Date
    period: number
    isSkipped: boolean
}

export function SkipSessionButton({ courseId, date, period, isSkipped }: SkipSessionButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleToggleSkip = async () => {
        setLoading(true)
        // Ensure date is a Date object
        const dateObj = new Date(date)

        if (isSkipped) {
            const result = await unskipSession(courseId, dateObj, period)
            if (result.success) {
                toast.success("Session unskipped")
            } else {
                toast.error("Failed to unskip session")
            }
        } else {
            const result = await skipSession(courseId, dateObj, period)
            if (result.success) {
                toast.success("Session skipped")
            } else {
                toast.error("Failed to skip session")
            }
        }
        setLoading(false)
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 ${isSkipped ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50" : "text-muted-foreground hover:text-red-600"}`}
            onClick={handleToggleSkip}
            disabled={loading}
            title={isSkipped ? "Unskip Session" : "Skip Session"}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSkipped ? (
                <Undo2 className="h-4 w-4" />
            ) : (
                <Ban className="h-4 w-4" />
            )}
        </Button>
    )
}
