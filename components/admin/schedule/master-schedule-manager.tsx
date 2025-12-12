"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Search, ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react"
import { updateSchedule } from "@/lib/actions/schedule.actions"
import { getPeriodLabel } from "@/lib/helpers/period-label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Constants
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
// Map UI day index (0-6) to DB day (1-7, where 7 is Sunday usually, but let's check legacy)
// Prisams Day: 0=Sunday, 1=Monday... 6=Saturday based on schema comment?
// Schema: "0=Sunday, 1=Monday, ... 6=Saturday"
// So UI "Monday" (index 0) should map to DB 1?
// Let's verify schema comment: "214:   dayOfWeek Int // 0=Sunday, 1=Monday, ... 6=Saturday"
// So Monday is 1. Saturday is 6. Sunday is 0.

const UI_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DB_DAY_MAPPING: Record<string, number> = {
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
    "Sunday": 0
}

const PERIODS = [0, 1, 2, 3, 4, 5, 6, 7]

interface Teacher {
    id: string
    name: string
    email: string
    image: string | null
    nickname: string | null
    taughtCourses: Course[]
}

interface Course {
    id: string
    name: string
    class: { name: string } | null
    subject: { name: string } | null
    schedules: Schedule[]
}

interface Schedule {
    dayOfWeek: number
    period: number
    deletedAt: Date | null
}

interface MasterScheduleManagerProps {
    teachers: Teacher[]
}

export function MasterScheduleManager({ teachers }: MasterScheduleManagerProps) {
    const router = useRouter()
    const [selectedDay, setSelectedDay] = useState("Monday")
    const [searchQuery, setSearchQuery] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [viewMode, setViewMode] = useState<"day" | "week">("day")
    const [conflictDetails, setConflictDetails] = useState<string[] | null>(null)
    const [showConflictDialog, setShowConflictDialog] = useState(false)

    // Filter teachers based on search
    const filteredTeachers = useMemo(() => {
        if (!searchQuery) return teachers
        const lower = searchQuery.toLowerCase()
        return teachers.filter(t =>
            t.name.toLowerCase().includes(lower) ||
            t.nickname?.toLowerCase().includes(lower) ||
            t.email.toLowerCase().includes(lower)
        )
    }, [teachers, searchQuery])

    // Helper to find assignment
    const getAssignment = (teacher: Teacher, period: number, dayStr: string) => {
        const dbDay = DB_DAY_MAPPING[dayStr]
        // Find course that has this schedule
        for (const course of teacher.taughtCourses) {
            const schedule = course.schedules.find(s =>
                s.dayOfWeek === dbDay &&
                s.period === period &&
                !s.deletedAt
            )
            if (schedule) return course
        }
        return null
    }

    const handleUpdateSchedule = async (teacherId: string, period: number, dayStr: string, courseId: string | null) => {
        try {
            setIsUpdating(true)
            const dbDay = DB_DAY_MAPPING[dayStr]
            const result = await updateSchedule(teacherId, dbDay, period, courseId)

            if (result.conflictDetails) {
                setConflictDetails(result.conflictDetails)
                setShowConflictDialog(true)
            } else if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Schedule updated")
                router.refresh()
            }
        } catch (error) {
            toast.error("Failed to update schedule")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Conflict Dialog */}
            <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Schedule Conflict Detected</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="flex flex-col gap-2 mt-2">
                                {conflictDetails?.map((detail, index) => (
                                    <div key={index} className="text-sm bg-red-50 text-red-700 p-2 rounded border border-red-200">
                                        {detail}
                                    </div>
                                ))}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowConflictDialog(false)}>
                            Understood
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
                    <div className="flex items-center border rounded-lg p-1 bg-muted/50 whitespace-nowrap">
                        <Button
                            variant={viewMode === "day" ? "secondary" : "ghost"}
                            size="sm"
                            className="text-xs"
                            onClick={() => setViewMode("day")}
                        >
                            Day View
                        </Button>
                        <Button
                            variant={viewMode === "week" ? "secondary" : "ghost"}
                            size="sm"
                            className="text-xs"
                            onClick={() => setViewMode("week")}
                        >
                            Full Week
                        </Button>
                    </div>

                    {viewMode === "day" && (
                        <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full md:w-auto">
                            <TabsList className="grid grid-cols-4 md:grid-cols-7 h-auto p-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10">
                                {UI_DAYS.map(day => (
                                    <TabsTrigger key={day} value={day} className="text-xs md:text-sm px-2 py-1.5">
                                        {day.slice(0, 3)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    )}
                </div>

                <div className="relative w-full md:w-64 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                        placeholder="Search teachers..."
                        className="pl-9 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 backdrop-blur-sm focus:bg-white/80 dark:focus:bg-slate-900/80 transition-all rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Grid */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto max-w-[100vw] md:max-w-[calc(100vw-3rem)]">
                    <Table className="relative min-w-full w-auto">
                        <TableHeader className="sticky top-0 bg-white/20 dark:bg-slate-900/20 backdrop-blur-md z-20 shadow-sm border-b border-white/10">
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="w-[200px] min-w-[200px] max-w-[200px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl z-30 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-slate-700 dark:text-slate-200 font-medium border-b border-r border-white/20 dark:border-white/10">
                                    Teacher
                                </TableHead>

                                {viewMode === "day" ? (
                                    PERIODS.map(period => (
                                        <TableHead key={period} className="text-center min-w-[140px] w-[140px] px-2 border-l border-white/10 text-slate-700 dark:text-slate-200 font-medium">
                                            {getPeriodLabel(period)}
                                        </TableHead>
                                    ))
                                ) : (
                                    ALL_DAYS.map(day => (
                                        <TableHead key={day} className="text-center min-w-[160px] w-[160px] px-1 border-l border-white/10 text-slate-700 dark:text-slate-200 font-medium">
                                            {day}
                                        </TableHead>
                                    ))
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTeachers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={viewMode === "day" ? PERIODS.length + 1 : ALL_DAYS.length + 1} className="h-24 text-center">
                                        No teachers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTeachers.map(teacher => (
                                    <TableRow key={teacher.id} className="hover:bg-white/30 dark:hover:bg-white/5 border-b border-white/10 dark:border-white/5 transition-colors">
                                        {/* Teacher Sticky Column */}
                                        <TableCell className="font-medium sticky left-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[200px] min-w-[200px] align-top py-2 border-b border-r border-white/20 dark:border-white/10 transition-colors group-hover:bg-white/60 dark:group-hover:bg-slate-800/60">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={teacher.image || ""} />
                                                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="truncate text-sm font-medium">{teacher.name}</span>
                                                    <span className="truncate text-xs text-muted-foreground">{teacher.nickname || teacher.email.split('@')[0]}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Period Cells */}
                                        {viewMode === "day" ? (
                                            PERIODS.map(period => {
                                                const assignedCourse = getAssignment(teacher, period, selectedDay)
                                                return (
                                                    <TableCell key={period} className="p-1 border-l border-white/10 w-[140px]">
                                                        <ScheduleCell
                                                            teacher={teacher}
                                                            period={period}
                                                            dayStr={selectedDay}
                                                            assignedCourse={assignedCourse}
                                                            onUpdate={handleUpdateSchedule}
                                                            disabled={isUpdating}
                                                        />
                                                    </TableCell>
                                                )
                                            })
                                        ) : (
                                            ALL_DAYS.map(day => (
                                                <TableCell key={day} className="p-1 border-l border-white/10 w-[160px] align-top bg-white/5">
                                                    <div className="grid grid-cols-1 gap-1">
                                                        {PERIODS.map(period => {
                                                            const assignedCourse = getAssignment(teacher, period, day)
                                                            return (
                                                                <div key={period} className="flex items-center gap-1">
                                                                    <div className="w-4 text-[10px] text-muted-foreground font-mono shrink-0 text-right">
                                                                        {period === 0 ? "M" : period === 7 ? "N" : period}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <ScheduleCell
                                                                            teacher={teacher}
                                                                            period={period}
                                                                            dayStr={day}
                                                                            assignedCourse={assignedCourse}
                                                                            onUpdate={handleUpdateSchedule}
                                                                            disabled={isUpdating}
                                                                            compact={true}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </TableCell>
                                            ))
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
                Showing {filteredTeachers.length} teachers. Schedules are saved automatically.
            </div>
        </div>
    )
}

interface ScheduleCellProps {
    teacher: Teacher
    period: number
    dayStr: string
    assignedCourse: Course | null
    onUpdate: (teacherId: string, period: number, dayStr: string, courseId: string | null) => void
    disabled: boolean
    compact?: boolean
}

function ScheduleCell({ teacher, period, dayStr, assignedCourse, onUpdate, disabled, compact }: ScheduleCellProps) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "rounded-xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200",
                        compact ? "h-[40px] p-0.5 text-[9px]" : "h-[50px] p-1",
                        assignedCourse
                            ? "bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200/50 dark:border-indigo-800/50 border-solid hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30"
                            : "border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/5 hover:border-white/30",
                        disabled && "opacity-50 cursor-wait"
                    )}
                >
                    {assignedCourse ? (
                        <>
                            <span className={cn("font-medium text-slate-700 dark:text-slate-200 leading-tight line-clamp-1", compact ? "text-[9px]" : "text-xs line-clamp-2")}>
                                {assignedCourse.name}
                            </span>
                            {!compact && (
                                <span className="text-[10px] text-muted-foreground mt-0.5 max-w-full truncate">
                                    {assignedCourse.class?.name}
                                </span>
                            )}
                        </>
                    ) : (
                        <div className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                            <Plus className={cn("text-muted-foreground", compact ? "h-3 w-3" : "h-4 w-4")} />
                        </div>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Select course..." />
                    <CommandList>
                        <CommandEmpty>No courses found.</CommandEmpty>
                        <CommandGroup heading="Assignments">
                            <CommandItem
                                onSelect={() => {
                                    onUpdate(teacher.id, period, dayStr, null)
                                    setOpen(false)
                                }}
                                className="text-red-600 cursor-pointer"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Clear Slot
                            </CommandItem>

                            {teacher.taughtCourses.map(course => (
                                <CommandItem
                                    key={course.id}
                                    onSelect={() => {
                                        onUpdate(teacher.id, period, dayStr, course.id)
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{course.name}</span>
                                        <span className="text-xs text-muted-foreground">{course.class?.name || "No Class"}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
