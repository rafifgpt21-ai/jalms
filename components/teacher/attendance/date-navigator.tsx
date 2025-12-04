"use client"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, subDays } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Since we don't have a Calendar component installed, we'll use a simple input for now inside the popover
// or just rely on the prev/next buttons.
// Actually, let's just use a native date input for the "jump to date" feature if needed, 
// but styling it to look like a button.

export function DateNavigator() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const dateParam = searchParams.get("date")
    const date = dateParam ? new Date(dateParam) : new Date()

    const handleDateChange = (newDate: Date) => {
        const dateString = format(newDate, "yyyy-MM-dd")
        router.push(`?date=${dateString}`)
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateChange(subDays(date, 1))}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="relative">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Jump to date:</label>
                            <input
                                type="date"
                                className="border rounded p-2"
                                value={format(date, "yyyy-MM-dd")}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleDateChange(new Date(e.target.value))
                                    }
                                }}
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleDateChange(new Date())}
                            >
                                Go to Today
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateChange(addDays(date, 1))}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
