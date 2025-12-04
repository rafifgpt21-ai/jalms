"use client"

import { useEffect, useState, useTransition } from "react"
import { useParams } from "next/navigation"
import { format } from "date-fns"
import { Loader2, Save, Edit, ChevronDown, ChevronUp, Eye, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAssignmentDetails, updateSubmissionScore } from "@/lib/actions/teacher.actions"
import { AddTaskModal } from "@/components/teacher/add-task-modal"
import { SubmissionGradeDialog } from "@/components/teacher/tasks/submission-grade-dialog"
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
import { cn } from "@/lib/utils"

export default function TaskWorkspacePage() {
    const params = useParams()
    const taskId = params.taskId as string

    const [assignment, setAssignment] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [scores, setScores] = useState<Record<string, number>>({})
    const [dirty, setDirty] = useState<Record<string, boolean>>({})
    const [showDescription, setShowDescription] = useState(true)
    const [unGradeId, setUnGradeId] = useState<string | null>(null)

    useEffect(() => {
        if (taskId) {
            loadAssignment()
        }
    }, [taskId])

    async function loadAssignment() {
        setLoading(true)
        console.log("Loading assignment details for:", taskId)
        const res = await getAssignmentDetails(taskId)
        console.log("Assignment details response:", res)
        if (res.assignment) {
            setAssignment(res.assignment)
            // Initialize scores
            const initialScores: Record<string, number> = {}
            res.assignment.submissions.forEach((sub: any) => {
                console.log(`Processing submission for student ${sub.studentId}:`, sub)
                if (sub.grade !== null) {
                    console.log(`Setting score for ${sub.studentId} to ${sub.grade}`)
                    initialScores[sub.studentId] = sub.grade
                }
            })
            console.log("Initial scores:", initialScores)
            setScores(initialScores)
        } else {
            toast.error("Failed to load assignment")
        }
        setLoading(false)
    }

    const handleScoreChange = (studentId: string, value: string) => {
        if (value === "") {
            setScores(prev => {
                const newScores = { ...prev }
                delete newScores[studentId]
                return newScores
            })
            setDirty(prev => ({ ...prev, [studentId]: true }))
            return
        }

        const numValue = parseFloat(value)
        if (!isNaN(numValue)) {
            if (numValue >= 0 && numValue <= 100) {
                setScores(prev => ({ ...prev, [studentId]: numValue }))
                setDirty(prev => ({ ...prev, [studentId]: true }))
            }
        }
    }

    const saveScore = (studentId: string) => {
        const score = scores[studentId]
        if (score === undefined) return

        startTransition(async () => {
            const res = await updateSubmissionScore(taskId, studentId, score)
            if (res.submission) {
                toast.success("Score saved")
                setDirty(prev => ({ ...prev, [studentId]: false }))
            } else {
                toast.error(res.error || "Failed to save score")
            }
        })
    }

    const confirmUnGrade = () => {
        if (!unGradeId) return

        console.log("Un-grading confirmed for:", unGradeId)
        startTransition(async () => {
            try {
                const res = await updateSubmissionScore(taskId, unGradeId, null)
                console.log("Un-grade response:", res)
                if (res.submission) {
                    toast.success("Grade removed")
                    setScores(prev => {
                        const newScores = { ...prev }
                        delete newScores[unGradeId]
                        return newScores
                    })
                    setDirty(prev => ({ ...prev, [unGradeId]: false }))

                    // Reload to ensure consistency
                    await loadAssignment()
                } else {
                    toast.error(res.error || "Failed to remove grade")
                }
            } catch (err) {
                console.error("Un-grade error:", err)
                toast.error("Something went wrong")
            } finally {
                setUnGradeId(null)
            }
        })
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!assignment) {
        return <div className="p-8">Assignment not found</div>
    }

    const students = assignment.course.students || []
    const submissions = assignment.submissions || []
    const isExtraCredit = assignment.isExtraCredit

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card>
                <div className="p-4 flex flex-row justify-between items-center gap-4">
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold leading-none tracking-tight">{assignment.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                            {assignment.dueDate && assignment.type !== "NON_SUBMISSION" && (
                                <span>
                                    Due: {format(new Date(assignment.dueDate), "PPP p")}
                                </span>
                            )}
                            <span>•</span>
                            <span>
                                Max Points: {assignment.maxPoints}
                            </span>
                            {assignment.type === "SUBMISSION" && assignment.latePenalty > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="text-red-500 font-medium">
                                        Late Penalty: {assignment.latePenalty}%
                                    </span>
                                </>
                            )}
                            {isExtraCredit && (
                                <>
                                    <span>•</span>
                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-green-100 text-green-800 hover:bg-green-100">
                                        Extra Credit
                                    </Badge>
                                </>
                            )}
                        </div>
                    </div>
                    <div>
                        <AddTaskModal
                            assignment={assignment}
                            onSuccess={loadAssignment}
                            trigger={
                                <Button variant="outline" size="sm" className="h-8">
                                    <Edit className="h-3.5 w-3.5 mr-2" />
                                    Edit Task
                                </Button>
                            }
                        />
                    </div>
                </div>
            </Card>

            {/* Description Card */}
            <Card>
                <div className="flex flex-row items-center justify-between p-4">
                    <h3 className="text-base font-semibold leading-none tracking-tight">Description</h3>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowDescription(!showDescription)}>
                        {showDescription ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {showDescription && (
                    <div className="px-4 pb-4">
                        <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {assignment.description || "No description provided."}
                        </div>
                    </div>
                )}
            </Card>

            {/* Student List - Desktop Table */}
            <div className="hidden md:!block">
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submission</TableHead>
                                    <TableHead className="w-[200px]">Score</TableHead>
                                    <TableHead className="w-[100px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student: any) => {
                                    const submission = submissions.find((s: any) => s.studentId === student.id)
                                    const isSubmitted = !!submission
                                    const submittedAt = submission?.submittedAt ? new Date(submission.submittedAt) : null
                                    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
                                    const isLate = submittedAt && dueDate && submittedAt > dueDate

                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>
                                                {assignment.type === "SUBMISSION" && (
                                                    <div className="flex items-center gap-2">
                                                        {scores[student.id] !== undefined ? (
                                                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                                Graded
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant={submission ? "secondary" : "outline"} className={submission ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}>
                                                                {submission ? "Submitted" : "Missing"}
                                                            </Badge>
                                                        )}
                                                        {isLate && (
                                                            <Badge variant="destructive">LATE</Badge>
                                                        )}
                                                    </div>
                                                )}
                                                {assignment.type === "NON_SUBMISSION" && (
                                                    scores[student.id] !== undefined ? (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            Graded
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">No Submission Required</Badge>
                                                    )
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isSubmitted && assignment.type === "SUBMISSION" ? (
                                                    <SubmissionGradeDialog
                                                        student={student}
                                                        submission={submission}
                                                        assignment={assignment}
                                                        currentScore={scores[student.id]}
                                                        onScoreUpdate={(sid: string, s: number) => {
                                                            setScores(prev => ({ ...prev, [sid]: s }))
                                                            setDirty(prev => ({ ...prev, [sid]: false }))
                                                        }}
                                                        trigger={
                                                            <Button variant="ghost" size="sm" className="h-8">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </Button>
                                                        }
                                                    />
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={scores[student.id] ?? ""}
                                                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                                        className={cn(
                                                            "w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                                            isExtraCredit ? "border-green-500 focus-visible:ring-green-500" : ""
                                                        )}
                                                        placeholder="0-100"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                saveScore(student.id)
                                                            }
                                                        }}
                                                    />
                                                    {scores[student.id] !== undefined && (
                                                        <div className="text-xs text-muted-foreground flex flex-col">
                                                            <span>({Math.round((scores[student.id] / 100) * assignment.maxPoints)} pts)</span>
                                                            {isLate && assignment.latePenalty > 0 && (
                                                                <span className="text-red-500">
                                                                    (-{assignment.latePenalty}%)
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {dirty[student.id] ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => saveScore(student.id)}
                                                        disabled={isPending}
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                ) : scores[student.id] !== undefined && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setUnGradeId(student.id)}
                                                        disabled={isPending}
                                                        title="Un-grade"
                                                    >
                                                        <RotateCcw className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No students enrolled in this course.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Student List - Mobile Cards */}
            <div className="md:!hidden space-y-4">
                {students.map((student: any) => {
                    const submission = submissions.find((s: any) => s.studentId === student.id)
                    const isSubmitted = !!submission
                    const submittedAt = submission?.submittedAt ? new Date(submission.submittedAt) : null
                    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
                    const isLate = submittedAt && dueDate && submittedAt > dueDate

                    return (
                        <Card key={student.id}>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium">{student.name}</div>
                                        <div className="mt-1">
                                            {assignment.type === "SUBMISSION" && (
                                                <div className="flex items-center gap-2">
                                                    {scores[student.id] !== undefined ? (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            Graded
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant={submission ? "secondary" : "outline"} className={submission ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}>
                                                            {submission ? "Submitted" : "Missing"}
                                                        </Badge>
                                                    )}
                                                    {isLate && (
                                                        <Badge variant="destructive">LATE</Badge>
                                                    )}
                                                </div>
                                            )}
                                            {assignment.type === "NON_SUBMISSION" && (
                                                scores[student.id] !== undefined ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        Graded
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">No Submission Required</Badge>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    {isSubmitted && assignment.type === "SUBMISSION" && (
                                        <SubmissionGradeDialog
                                            student={student}
                                            submission={submission}
                                            assignment={assignment}
                                            currentScore={scores[student.id]}
                                            onScoreUpdate={(sid: string, s: number) => {
                                                setScores(prev => ({ ...prev, [sid]: s }))
                                                setDirty(prev => ({ ...prev, [sid]: false }))
                                            }}
                                            trigger={
                                                <Button variant="outline" size="sm" className="h-8">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                            }
                                        />
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={scores[student.id] ?? ""}
                                                onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                                className={cn(
                                                    "h-10 text-lg w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                                    isExtraCredit ? "border-green-500 focus-visible:ring-green-500" : ""
                                                )}
                                                placeholder="0-100"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        saveScore(student.id)
                                                    }
                                                }}
                                            />
                                            {scores[student.id] !== undefined && (
                                                <div className="text-sm text-muted-foreground flex flex-col">
                                                    <span>({Math.round((scores[student.id] / 100) * assignment.maxPoints)} pts)</span>
                                                    {isLate && assignment.latePenalty > 0 && (
                                                        <span className="text-red-500">
                                                            (-{assignment.latePenalty}%)
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {dirty[student.id] ? (
                                        <Button
                                            size="default"
                                            variant="default"
                                            onClick={() => saveScore(student.id)}
                                            disabled={isPending}
                                            className="h-10 w-10 p-0 rounded-full"
                                        >
                                            <Save className="h-5 w-5" />
                                        </Button>
                                    ) : scores[student.id] !== undefined && (
                                        <Button
                                            size="default"
                                            variant="outline"
                                            onClick={() => setUnGradeId(student.id)}
                                            disabled={isPending}
                                            className="h-10 w-10 p-0 rounded-full"
                                        >
                                            <RotateCcw className="h-5 w-5 text-muted-foreground" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
                {students.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No students enrolled in this course.
                    </div>
                )}
            </div>

            <AlertDialog open={!!unGradeId} onOpenChange={(open) => !open && setUnGradeId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Grade?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the grade for this student. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmUnGrade} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remove Grade
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
