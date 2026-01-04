"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Search,
    ArrowUpDown,
    FileText,
    MoreHorizontal,
    ArrowLeft,
    BarChart3
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface StudentStat {
    id: string
    name: string
    image: string | null
    email: string
    attendance: number
    averageGrade: number
}

interface ClassDetailsViewProps {
    classData: any
    students: StudentStat[]
}

export function ClassDetailsView({ classData, students }: ClassDetailsViewProps) {
    const [search, setSearch] = useState("")
    const [sortConfig, setSortConfig] = useState<{ key: keyof StudentStat; direction: 'asc' | 'desc' } | null>(null)

    // Filter
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    )

    // Sort
    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (!sortConfig) return 0

        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        if (aValue === null || bValue === null) return 0

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
    })

    const handleSort = (key: keyof StudentStat) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" asChild>
                    <Link href="/homeroom" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-slate-100">{classData.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {classData.term.type} Semester {classData.term.academicYear?.name} • {students.length} Students
                    </p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search student..."
                        className="pl-9 bg-white dark:bg-slate-900"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/40 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Student Name
                                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100/50 transition-colors text-center" onClick={() => handleSort('attendance')}>
                                    <div className="flex items-center justify-center gap-2">
                                        Overall Attendance
                                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100/50 transition-colors text-center" onClick={() => handleSort('averageGrade')}>
                                    <div className="flex items-center justify-center gap-2">
                                        Average Grade
                                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sortedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                sortedStudents.map((student) => (
                                    <motion.tr
                                        key={student.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                                                    <AvatarImage src={student.image || undefined} />
                                                    <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-slate-100">{student.name}</div>
                                                    <div className="text-xs text-slate-500">{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={student.attendance < 75 ? "destructive" : "secondary"} className={
                                                student.attendance >= 90 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100" :
                                                    student.attendance >= 75 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100" : ""
                                            }>
                                                {student.attendance}%
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${student.averageGrade >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                                                student.averageGrade >= 70 ? "text-indigo-600 dark:text-indigo-400" :
                                                    "text-rose-600 dark:text-rose-400"
                                                }`}>
                                                {student.averageGrade.toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/homeroom/${classData.id}/students/${student.id}/grades`}>
                                                            <BarChart3 className="w-4 h-4 mr-2" />
                                                            View Grades
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/homeroom/${classData.id}/students/${student.id}/report`}>
                                                            <FileText className="w-4 h-4 mr-2" />
                                                            View Report Card
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
