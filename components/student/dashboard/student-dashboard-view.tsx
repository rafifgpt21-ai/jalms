"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, getHours } from "date-fns"
import {
    Calendar,
    Clock,
    BookOpen,
    ArrowRight,
    GraduationCap,
    AlertCircle,
    CheckCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPeriodLabel } from "@/lib/helpers/period-label"
import { cn } from "@/lib/utils"

export function StudentWelcome({ user }: { user: any }) {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const getGreeting = () => {
        const hour = getHours(currentTime)
        if (hour < 12) return "Good Morning"
        if (hour < 17) return "Good Afternoon"
        return "Good Evening"
    }

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-1 sm:p-2">
            <div>
                <h1 className="font-heading text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {format(currentTime, "EEEE, MMMM do, yyyy")}
                </p>
            </div>
        </div>
    )
}

export function StudentUpNextCard({ schedule }: { schedule: any[] }) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [nextClass, setNextClass] = useState<any>(null)

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)

        if (schedule && schedule.length > 0) {
            setNextClass(schedule[0])
        }

        return () => clearInterval(timer)
    }, [schedule])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 lg:col-span-2 h-full"
        >
            <div className="relative overflow-hidden rounded-3xl p-6 h-full min-h-[220px] flex flex-col justify-between shadow-xl shadow-indigo-500/20 group cursor-pointer hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-600/90 to-violet-700/90 dark:from-indigo-900/90 dark:to-violet-950/90 z-0" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-xl" />

                <div className="relative z-10 text-white">
                    <div className="flex items-center gap-2 text-indigo-100 bg-white/10 w-fit px-3 py-1 rounded-full text-sm border border-white/10">
                        <Clock className="w-4 h-4" />
                        <span>Up Next</span>
                    </div>

                    {nextClass ? (
                        <div className="mt-4">
                            <h2 className="text-3xl font-heading font-bold mb-1">{nextClass.course.reportName || nextClass.course.name}</h2>
                            <p className="text-indigo-100 text-lg flex items-center gap-2">
                                with {nextClass.course.teacher.name}
                                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                {getPeriodLabel(nextClass.period)}
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <h2 className="text-3xl font-heading font-bold">No classes scheduled</h2>
                            <p className="text-indigo-100 text-lg">Enjoy your free time!</p>
                        </div>
                    )}
                </div>

                <div className="relative z-10 flex justify-between items-end mt-4">
                    <div className="text-indigo-100 font-medium">
                        {schedule.length} classes remaining today
                    </div>
                    <div className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors cursor-pointer">
                        <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export function StudentScheduleCard({ schedule }: { schedule: any[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 lg:col-span-2 row-span-2"
        >
            <Card className="h-full border-none shadow-xl bg-white/60 dark:bg-slate-900/40 ring-1 ring-black/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-heading text-xl">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        Today's Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {schedule.length > 0 ? schedule.map((slot, i) => (
                        <div key={i} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 cursor-pointer">
                            <div className="flex flex-col items-center justify-center min-w-12 text-center">
                                <div className="text-sm font-bold text-slate-400 font-heading tracking-wide uppercase">Period</div>
                                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{getPeriodLabel(slot.period)}</div>
                            </div>
                            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                                    {slot.course.reportName || slot.course.name}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    {slot.course.teacher.name}
                                    {slot.topic && <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full ml-2 lowercase">{slot.topic}</span>}
                                </p>
                            </div>
                            <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-slate-400">
                            No classes today.
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

export function StudentDeadlinesWidget({ upcomingDeadlines }: { upcomingDeadlines: any[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 lg:col-span-2 row-span-2"
        >
            <Card className="h-full border-none shadow-xl bg-white/60 dark:bg-slate-900/40 ring-1 ring-black/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-heading text-xl">
                        <BookOpen className="w-5 h-5 text-orange-500" />
                        Deadlines
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((assignment: any) => {
                        const submission = assignment.submissions[0]
                        const isSubmitted = !!submission

                        return (
                            <Link
                                href={`/student/courses/${assignment.courseId}/tasks/${assignment.id}`}
                                key={assignment.id}
                                className="block group"
                            >
                                <div className="flex items-start justify-between p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-indigo-900/20 hover:border-indigo-400 hover:shadow-md transition-all">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                {assignment.title}
                                            </h4>
                                            {isSubmitted && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {assignment.course.reportName || assignment.course.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-sm font-bold",
                                            isSubmitted ? "text-green-600" : "text-orange-600"
                                        )}>
                                            {format(new Date(assignment.dueDate), "MMM d")}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {format(new Date(assignment.dueDate), "h:mm a")}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    }) : (
                        <div className="text-center py-10 text-slate-400">
                            No upcoming deadlines.
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}

export function StudentGradesWidget({ recentGrades, deadlinesCount }: { recentGrades: any[], deadlinesCount: number }) {
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="md:col-span-1"
            >
                <div className="bg-white/60 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 rounded-3xl p-6 h-full flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none hover:bg-white/70 transition-colors">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 w-fit rounded-2xl text-orange-600 dark:text-orange-400 mb-4">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-4xl font-heading font-bold text-slate-800 dark:text-slate-100">
                            {deadlinesCount}
                        </div>
                        <div className="text-slate-500 text-sm font-medium">Due assignments</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="md:col-span-1"
            >
                <div className="bg-white/60 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 rounded-3xl p-6 h-full flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none hover:bg-white/70 transition-colors">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 w-fit rounded-2xl text-emerald-600 dark:text-emerald-400 mb-4">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-4xl font-heading font-bold text-slate-800 dark:text-slate-100">
                            {recentGrades.length > 0 ? recentGrades[0].grade : '-'}
                        </div>
                        <div className="text-slate-500 text-sm font-medium">Latest Grade</div>
                    </div>
                </div>
            </motion.div>
        </>
    )
}
