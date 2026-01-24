"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
    BookOpen,
    Users,
    FileText,
    CheckCircle,
    Calendar,
    Clock,
    ArrowUpRight,
    Filter,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPeriodLabel } from "@/lib/helpers/period-label"
import { cn } from "@/lib/utils"

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

interface StatsSectionProps {
    stats: {
        courses: number
        students: number
        assignments: number
        ungraded: number
    }
}

export function StatsSection({ stats }: StatsSectionProps) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
            <motion.div variants={item} className="contents">
                <StatCard
                    title="Needs Grading"
                    value={stats.ungraded}
                    icon={CheckCircle}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="Active Assignments"
                    value={stats.assignments}
                    icon={FileText}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="Total Courses"
                    value={stats.courses}
                    icon={BookOpen}
                    color="text-indigo-500"
                    bg="bg-indigo-500/10"
                />
                <StatCard
                    title="Total Students"
                    value={stats.students}
                    icon={Users}
                    color="text-violet-500"
                    bg="bg-violet-500/10"
                />
            </motion.div>
        </motion.div>
    )
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <Card className="border-none shadow-lg bg-white/60 dark:bg-slate-900/40 ring-1 ring-black/5 dark:ring-white/10">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2 rounded-xl", bg, color)}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold font-heading text-slate-800 dark:text-slate-100">{value}</h3>
                    <p className="font-medium text-slate-500 dark:text-slate-400 text-sm">{title}</p>
                </div>
            </div>
        </Card>
    )
}

interface ClassesSectionProps {
    classesToday: any[]
}

export function ClassesSection({ classesToday }: ClassesSectionProps) {
    return (
        <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            className="w-full"
        >
            <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/40 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold font-heading text-slate-800 dark:text-slate-100">Classes Today</h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                {format(new Date(), "EEEE, MMMM do")}
                            </p>
                        </div>
                        <Calendar className="w-10 h-10 text-indigo-200 dark:text-indigo-900/30" />
                    </div>

                    {classesToday.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classesToday.map((schedule) => (
                                <Link key={schedule.id} href={`/teacher/courses/${schedule.courseId}/attendance/session?date=${format(new Date(), "yyyy-MM-dd")}&period=${schedule.period}`}>
                                    <div className="group relative p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-mono">
                                                {getPeriodLabel(schedule.period)}
                                            </Badge>
                                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                            {schedule.course.class?.name || schedule.course.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                                            {schedule.topic || "No topic set"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-400">No classes scheduled for today.</p>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}

interface AssignmentsWidgetProps {
    allAssignments: any[]
    activeCourses: any[]
}

export function AssignmentsWidget({ allAssignments, activeCourses }: AssignmentsWidgetProps) {
    const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all")

    // Filter assignments for the widget
    const filteredAssignments = selectedCourseFilter === "all"
        ? allAssignments
        : allAssignments.filter(a => a.course.id === selectedCourseFilter)

    return (
        <motion.div
            variants={item}
            initial="hidden"
            animate="show"
        >
            <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/40 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 h-[500px] flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 z-10">
                    <div>
                        <h3 className="font-bold font-heading text-lg text-slate-800 dark:text-slate-200">Assignments Overview</h3>
                        <p className="text-xs text-slate-500">Manage and track progress</p>
                    </div>

                    {/* Course Filter */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                            <select
                                className="h-9 w-[160px] pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={selectedCourseFilter}
                                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                            >
                                <option value="all">All Courses</option>
                                {activeCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {filteredAssignments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <FileText className="w-12 h-12 mb-3 opacity-20" />
                            <p>No active assignments found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredAssignments.map((assignment) => {
                                const gradedCount = assignment.submissions.length
                                const totalStudents = assignment.course._count.students
                                const progress = totalStudents > 0 ? (gradedCount / totalStudents) * 100 : 0

                                return (
                                    <div key={assignment.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-slate-200 dark:border-slate-700 text-slate-500">
                                                        {assignment.type === 'SUBMISSION' ? 'TASK' : assignment.type}
                                                    </Badge>
                                                    <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">{assignment.title}</h4>
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-2">
                                                    <span className="truncate max-w-[150px]">{assignment.course.name}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {format(new Date(assignment.dueDate), "MMM d")}
                                                    </span>
                                                </p>
                                            </div>
                                            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30">
                                                <Link href={`/teacher/courses/${assignment.course.id}/tasks/${assignment.id}`}>
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>

                                        {/* Progress */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 min-w-[60px] text-right">
                                                {gradedCount}/{totalStudents} Graded
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}

interface RecentSubmissionsSectionProps {
    recentSubmissions: any[]
}

export function RecentSubmissionsSection({ recentSubmissions }: RecentSubmissionsSectionProps) {
    return (
        <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            className="lg:col-span-1 space-y-6"
        >
            <Card className="h-full min-h-[500px] border-none shadow-xl bg-white/60 dark:bg-slate-900/40 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 flex flex-col">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-lg font-heading text-slate-800 dark:text-slate-200">
                        Recent Submissions
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0">
                    {recentSubmissions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            No recent activity
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentSubmissions.map((sub, i) => (
                                <div key={sub.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                            {sub.student.name}
                                        </p>
                                        <span className="text-[10px] text-slate-400">
                                            {format(new Date(sub.submittedAt), "MMM d")}
                                        </span>
                                    </div>
                                    <div className="mb-3">
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                                            {sub.assignment.title}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {sub.assignment.course.name}
                                        </p>
                                    </div>
                                    <Button asChild size="sm" variant="secondary" className="w-full text-xs h-7 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/50">
                                        <Link href={`/teacher/courses/${sub.assignment.courseId}/tasks/${sub.assignmentId}`}>
                                            Grade Submission
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
