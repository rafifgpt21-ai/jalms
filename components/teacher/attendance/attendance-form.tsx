"use client"

import { useState } from "react"
import { AttendanceStatus, User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { saveAttendance, saveAttendanceTopic } from "@/lib/actions/attendance.actions"
import { toast } from "sonner"
import { Loader2, Save, CheckCircle2, XCircle, Clock, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface StudentWithStatus {
    student: User
    status: AttendanceStatus | null
    recordId: string | null
    topic: string | null
    excuseReason: string | null
}

interface AttendanceFormProps {
    courseId: string
    date: Date
    period: number
    initialStudents: StudentWithStatus[]
    initialTopic: string
}

export function AttendanceForm({ courseId, date, period, initialStudents, initialTopic }: AttendanceFormProps) {
    const [students, setStudents] = useState(initialStudents)
    const [topic, setTopic] = useState(initialTopic)
    const [saving, setSaving] = useState(false)
    const [topicSaving, setTopicSaving] = useState(false)
    const [applyToAll, setApplyToAll] = useState(false)
    const [showTopicConfirm, setShowTopicConfirm] = useState(false)

    const [saved, setSaved] = useState(false)

    // ... (other handlers)

    const handleSaveTopicClick = () => {
        setShowTopicConfirm(true)
    }

    const confirmSaveTopic = async (applyToAllSessions: boolean) => {
        setShowTopicConfirm(false)
        setTopicSaving(true)
        const result = await saveAttendanceTopic(courseId, date, period, topic || "", applyToAllSessions)
        if (result.success) {
            toast.success("Topic saved successfully")
        } else {
            toast.error(result.error || "Failed to save topic")
        }
        setTopicSaving(false)
    }

    // ...

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setStudents(prev => prev.map(s =>
            s.student.id === studentId ? { ...s, status } : s
        ))
    }

    const handleExcuseReasonChange = (studentId: string, reason: string) => {
        setStudents(prev => prev.map(s =>
            s.student.id === studentId ? { ...s, excuseReason: reason } : s
        ))
    }

    const markAll = (status: AttendanceStatus) => {
        setStudents(prev => prev.map(s => ({ ...s, status })))
    }

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)
        const records = students
            .filter(s => s.status !== null)
            .map(s => ({
                studentId: s.student.id,
                status: s.status!,
                excuseReason: s.status === "EXCUSED" ? s.excuseReason : null
            }))

        const result = await saveAttendance(courseId, date, period, topic, records, applyToAll)

        if (result.success) {
            toast.success("Attendance saved successfully")
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } else {
            toast.error(result.error || "Failed to save attendance")
        }
        setSaving(false)
    }

    const getStatusColor = (status: AttendanceStatus | null, current: AttendanceStatus) => {
        if (status === current) {
            switch (current) {
                case "PRESENT": return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                case "ABSENT": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                case "EXCUSED": return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
            }
        }
        return "bg-transparent hover:bg-gray-100 text-gray-500 border-transparent"
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start bg-white p-4 rounded-lg border shadow-sm">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="topic" className="text-sm font-medium mb-1 block">Topic / Lesson Plan</Label>
                        <div className="flex gap-2 w-full max-w-xl">
                            <Input
                                id="topic"
                                placeholder="e.g., Introduction to Algebra"
                                value={topic || ""}
                                onChange={(e) => setTopic(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleSaveTopicClick}
                                disabled={topicSaving}
                            >
                                {topicSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-3 lg:items-end">
                    <div className="flex gap-2 justify-start lg:justify-end w-full lg:w-auto">
                        <Button variant="outline" size="sm" onClick={() => markAll("PRESENT")} className="flex-1 lg:flex-none">
                            Mark All Present
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className={cn("flex-1 lg:flex-none transition-all duration-200", saved && "bg-green-600 hover:bg-green-700 text-white")}
                        >
                            {saving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : saved ? (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {saved ? "Saved!" : "Save Attendance"}
                        </Button>
                    </div>
                    <div className="flex items-center justify-between gap-3 border rounded-md px-3 py-2 bg-muted/30 w-full lg:w-auto">
                        <Label htmlFor="apply-all" className="cursor-pointer text-sm font-medium text-muted-foreground">Apply to all sessions today</Label>
                        <Switch id="apply-all" checked={applyToAll} onCheckedChange={setApplyToAll} />
                    </div>
                </div>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <p className="text-muted-foreground">No students found for this class.</p>
                </div>
            ) : null}

            <AlertDialog open={showTopicConfirm} onOpenChange={setShowTopicConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Save Topic</AlertDialogTitle>
                        <AlertDialogDescription>
                            Do you want to apply this topic to all sessions for this course today?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => confirmSaveTopic(false)}>No, just this session</AlertDialogCancel>
                        <AlertDialogAction onClick={() => confirmSaveTopic(true)}>Yes, apply to all</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="space-y-4">
                {/* Mobile View: Cards */}
                <div className="grid gap-4 md:hidden">
                    {students.map(({ student, status, excuseReason }) => (
                        <div key={student.id} className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={student.image || undefined} />
                                    <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-xs text-muted-foreground">{student.email}</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("w-full gap-1 transition-all", getStatusColor(status, "PRESENT"))}
                                        onClick={() => handleStatusChange(student.id, "PRESENT")}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="sr-only sm:not-sr-only">Present</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("w-full gap-1 transition-all", getStatusColor(status, "ABSENT"))}
                                        onClick={() => handleStatusChange(student.id, "ABSENT")}
                                    >
                                        <XCircle className="h-4 w-4" />
                                        <span className="sr-only sm:not-sr-only">Absent</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("w-full gap-1 transition-all", getStatusColor(status, "EXCUSED"))}
                                        onClick={() => handleStatusChange(student.id, "EXCUSED")}
                                    >
                                        <HelpCircle className="h-4 w-4" />
                                        <span className="sr-only sm:not-sr-only">Excused</span>
                                    </Button>
                                </div>
                                {status === "EXCUSED" && (
                                    <div className="animate-in fade-in slide-in-from-top-1">
                                        <Input
                                            placeholder="Reason for excuse..."
                                            value={excuseReason || ""}
                                            onChange={(e) => handleExcuseReasonChange(student.id, e.target.value)}
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block! border rounded-lg bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Student</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map(({ student, status, excuseReason }) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={student.image || undefined} />
                                                <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{student.name}</div>
                                                <div className="text-xs text-muted-foreground">{student.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <div className="flex gap-2 flex-wrap">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn("gap-1 transition-all", getStatusColor(status, "PRESENT"))}
                                                    onClick={() => handleStatusChange(student.id, "PRESENT")}
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Present
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn("gap-1 transition-all", getStatusColor(status, "ABSENT"))}
                                                    onClick={() => handleStatusChange(student.id, "ABSENT")}
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Absent
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn("gap-1 transition-all", getStatusColor(status, "EXCUSED"))}
                                                    onClick={() => handleStatusChange(student.id, "EXCUSED")}
                                                >
                                                    <HelpCircle className="h-4 w-4" />
                                                    Excused
                                                </Button>
                                            </div>
                                            {status === "EXCUSED" && (
                                                <div className="max-w-sm animate-in fade-in slide-in-from-top-1">
                                                    <Input
                                                        placeholder="Reason for excuse..."
                                                        value={excuseReason || ""}
                                                        onChange={(e) => handleExcuseReasonChange(student.id, e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
