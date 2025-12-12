"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
    Search,
    Download,
    Filter,
    MoreHorizontal,
    AlertCircle,
    CheckCircle
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface GradebookViewProps {
    data: {
        gradebook: any[]
        assignments: any[]
        courseName: string
        maxPoints: number
    }
}

export function GradebookView({ data }: GradebookViewProps) {
    const { gradebook, assignments, courseName, maxPoints } = data
    const [searchQuery, setSearchQuery] = useState("")

    const filteredStudents = gradebook.filter(student =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-slate-800"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none border-dashed bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl">
                        <Filter className="mr-2 h-4 w-4 opacity-50" />
                        Filter
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none border-dashed bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl">
                        <Download className="mr-2 h-4 w-4 opacity-50" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Main Gradebook Container */}
            <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-heading font-bold text-slate-800 dark:text-slate-100">
                                {courseName}
                            </CardTitle>
                            <p className="text-sm text-slate-500">Course Total: {maxPoints} pts</p>
                        </div>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                {/* Sticky Student Column */}
                                <TableHead className="w-[250px] sticky left-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-slate-100 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Student
                                </TableHead>

                                <TableHead className="w-[100px] text-center font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/50">
                                    Grade
                                </TableHead>
                                <TableHead className="w-[100px] text-center bg-slate-50/50 dark:bg-slate-800/50">
                                    Attendance
                                </TableHead>

                                {/* Assignment Columns */}
                                {assignments.map((assignment) => (
                                    <TableHead key={assignment.id} className="min-w-[150px] text-center bg-transparent">
                                        <div className="flex flex-col items-center justify-center py-2">
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={assignment.title}>
                                                {assignment.title}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-normal">
                                                {assignment.maxPoints} pts
                                            </span>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={assignments.length + 3} className="h-24 text-center text-slate-500">
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800 group transition-colors">
                                        {/* Sticky Student Name */}
                                        <TableCell className="sticky left-0 z-20 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-r border-slate-100 dark:border-slate-800 font-medium text-slate-900 dark:text-slate-100 group-hover:bg-indigo-50/20 dark:group-hover:bg-indigo-900/10">
                                            <div className="flex items-center gap-3">
                                                {/* <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                                                    <AvatarImage src={student.studentImage} />
                                                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                                        {student.studentName.substring(0,2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar> */}
                                                <div className="flex flex-col">
                                                    <span>{student.studentName}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Total Grade */}
                                        <TableCell className="text-center bg-slate-50/30 dark:bg-slate-800/30 font-bold group-hover:bg-indigo-50/10 dark:group-hover:bg-indigo-900/10">
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-sm",
                                                student.totalScore >= 90 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" :
                                                    student.totalScore >= 80 ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" :
                                                        student.totalScore >= 70 ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" :
                                                            "text-red-600 bg-red-50 dark:bg-red-900/20"
                                            )}>
                                                {student.totalScore}%
                                            </span>
                                        </TableCell>

                                        {/* Attendance */}
                                        <TableCell className="text-center bg-slate-50/30 dark:bg-slate-800/30 text-sm text-slate-600 dark:text-slate-400 group-hover:bg-indigo-50/10 dark:group-hover:bg-indigo-900/10">
                                            {Math.round(student.attendancePercentage)}%
                                        </TableCell>

                                        {/* Assignment Scores */}
                                        {assignments.map((assignment) => {
                                            const score = student.scores[assignment.id]
                                            return (
                                                <TableCell key={assignment.id} className="text-center p-0">
                                                    <div className="h-full w-full py-3 flex items-center justify-center">
                                                        {score !== null ? (
                                                            <span className={cn(
                                                                "font-medium text-sm",
                                                                score < assignment.maxPoints * 0.6 ? "text-red-500" :
                                                                    score === assignment.maxPoints ? "text-emerald-600 dark:text-emerald-400" :
                                                                        "text-slate-700 dark:text-slate-300"
                                                            )}>
                                                                {score}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-700 text-xs">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
