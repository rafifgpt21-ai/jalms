"use client"

import { Button } from "@/components/ui/button"
import { skipAllSessions } from "@/lib/actions/attendance.actions"
import { Loader2, Ban } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface SkipAllButtonProps {
    teacherId: string
    date: Date
}

export function SkipAllButton({ teacherId, date }: SkipAllButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleSkipAll = async () => {
        console.log("Skip All clicked")
        toast.info("Starting skip process...")

        // if (!confirm("Are you sure you want to skip all sessions for this day?")) return

        setLoading(true)
        try {
            // Ensure date is a Date object (it might be a string due to serialization)
            const dateObj = new Date(date)
            console.log("Calling skipAllSessions with date:", dateObj)

            const result = await skipAllSessions(teacherId, dateObj)
            console.log("skipAllSessions result:", result)

            if (result.success) {
                toast.success(result.message || "All sessions skipped")
            } else {
                toast.error(result.message || result.error || "Failed to skip sessions")
            }
        } catch (e) {
            console.error("Error in handleSkipAll:", e)
            toast.error("An error occurred: " + (e instanceof Error ? e.message : String(e)))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSkipAll}
            disabled={loading}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            Skip All
        </Button>
    )
}
