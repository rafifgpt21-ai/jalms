"use client"

import { useState } from "react"
import { Schedule, Course, Class, Subject } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

type ScheduleWithDetails = Schedule & {
    course: Course & {
        teacher: {
            id: string
            name: string | null
            nickname: string | null
            image: string | null
        }
        class: Class | null
        subject: Subject | null
    }
}

interface MasterScheduleViewProps {
    schedules: ScheduleWithDetails[]
}

import { getPeriodLabel } from "@/lib/helpers/period-label"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const PERIODS = [0, 1, 2, 3, 4, 5, 6, 7]

export function MasterScheduleView({ schedules }: MasterScheduleViewProps) {
    const [selectedDay, setSelectedDay] = useState(0) // 0 = Monday

    // Group schedules by Teacher ID -> Period -> Schedule
    // First, identify all unique teachers
    const teachersMap = new Map<string, {
        id: string
        name: string
        nickname: string | null
        image: string | null
    }>()

    schedules.forEach(s => {
        if (s.course && s.course.teacher) {
            teachersMap.set(s.course.teacher.id, {
                id: s.course.teacher.id,
                name: s.course.teacher.name || "Unknown",
                nickname: s.course.teacher.nickname,
                image: s.course.teacher.image
            })
        }
    })

    const teachers = Array.from(teachersMap.values()).sort((a, b) => a.name.localeCompare(b.name))

    // Helper to get schedule for a specific teacher, day, and period
    const getSchedule = (teacherId: string, dayIndex: number, period: number) => {
        // DB Day: 1=Mon, 2=Tue... 6=Sat, 0=Sun (Wait, usually 0=Sun in JS, but let's check prisma usage. 
        // In previous code `schedule-grid.tsx`:
        // const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        // dayIndex 0 (Mon) -> dbDay 1
        // dayIndex 6 (Sun) -> dbDay 0

        let dbDay = dayIndex + 1
        if (dayIndex === 6) dbDay = 0

        return schedules.find(s =>
            s.course.teacherId === teacherId &&
            s.dayOfWeek === dbDay &&
            s.period === period
        )
    }

    return (
        <div className="space-y-6">
            {/* Day Selector */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start bg-white p-2 rounded-lg border shadow-sm">
                {DAYS.map((day, index) => (
                    <Button
                        key={day}
                        variant={selectedDay === index ? "default" : "ghost"}
                        onClick={() => setSelectedDay(index)}
                        className={cn(
                            "flex-1 md:flex-none",
                            selectedDay === index && "shadow-sm"
                        )}
                    >
                        {day}
                    </Button>
                ))}
            </div>

            {/* Timetable Grid */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table className="min-w-[1000px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px] bg-gray-50 sticky left-0 z-10 border-r">Teacher</TableHead>
                                {PERIODS.map(period => (
                                    <TableHead key={period} className="text-center w-[150px] bg-gray-50 border-r last:border-r-0">
                                        {getPeriodLabel(period)}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={PERIODS.length + 1} className="h-24 text-center">
                                        No schedules found for this active semester.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teachers.map(teacher => (
                                    <TableRow key={teacher.id} className="hover:bg-transparent">
                                        <TableCell className="font-medium bg-white sticky left-0 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={teacher.image || undefined} />
                                                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{teacher.name}</span>
                                                    {teacher.nickname && (
                                                        <span className="text-xs text-muted-foreground">{teacher.nickname}</span>
                                                    )}
                                                    <Link
                                                        href={`/admin/schedule?search=${encodeURIComponent(teacher.name)}`}
                                                        className="text-[10px] text-blue-500 hover:underline mt-0.5"
                                                    >
                                                        View Schedule
                                                    </Link>
                                                </div>
                                            </div>
                                        </TableCell>
                                        {PERIODS.map(period => {
                                            const schedule = getSchedule(teacher.id, selectedDay, period)
                                            return (
                                                <TableCell key={period} className="p-2 border-r last:border-r-0 align-top h-[100px]">
                                                    {schedule ? (
                                                        <div className="h-full w-full bg-blue-50 border border-blue-100 rounded-md p-2 flex flex-col gap-1 text-center justify-center hover:bg-blue-100 transition-colors">
                                                            <div className="font-semibold text-xs line-clamp-2" title={schedule.course.name}>
                                                                {schedule.course.name}
                                                            </div>
                                                            <Badge variant="outline" className="w-fit mx-auto text-[10px] bg-white whitespace-nowrap">
                                                                {schedule.course.class?.name || "No Class"}
                                                            </Badge>
                                                            {schedule.course.subject && (
                                                                <span className="text-[10px] text-gray-500 line-clamp-1">
                                                                    {schedule.course.subject.code}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <span className="text-gray-200 text-xs">-</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
