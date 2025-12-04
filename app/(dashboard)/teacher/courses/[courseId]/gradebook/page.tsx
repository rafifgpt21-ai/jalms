"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCourseGradebook } from "@/lib/actions/teacher.actions"

export default function GradebookPage() {
    const params = useParams()
    const courseId = params.courseId as string

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (courseId) {
            loadGradebook()
        }
    }, [courseId])

    async function loadGradebook() {
        setLoading(true)
        setError(null)
        try {
            const res = await getCourseGradebook(courseId)
            if (res.gradebook) {
                setData(res)
            } else {
                setError(res.error || "Failed to load gradebook")
                toast.error(res.error || "Failed to load gradebook")
            }
        } catch (err) {
            setError("An unexpected error occurred")
            console.error(err)
        }
        setLoading(false)
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (error) {
        return <div className="p-8 text-red-500">Error: {error}</div>
    }

    if (!data) {
        return <div className="p-8">Gradebook not found</div>
    }

    const { gradebook, courseName } = data

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Gradebook: {courseName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead className="text-right">Attendance %</TableHead>
                                <TableHead className="text-right">Total Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gradebook.map((student: any) => (
                                <TableRow key={student.studentId}>
                                    <TableCell className="font-medium">{student.studentName}</TableCell>
                                    <TableCell className="text-right">
                                        {Math.round(student.attendancePercentage)}%
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg">
                                        {student.totalScore}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {gradebook.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No students enrolled.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
