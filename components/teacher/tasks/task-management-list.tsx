"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format, isPast, isToday } from "date-fns"
import { ArrowRight, Calendar, ClipboardList, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { WorkspacePanel, WorkspaceToolbar } from "@/components/workspace/workspace-page"

type TaskListItem = {
    id: string
    title: string
    type: "SUBMISSION" | "NON_SUBMISSION" | "QUIZ"
    dueDate: Date | string
    maxPoints: number
    isExtraCredit: boolean
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null
    _count: { submissions: number }
}

function taskTypeLabel(type: TaskListItem["type"]) {
    if (type === "QUIZ") return "Quiz"
    if (type === "NON_SUBMISSION") return "In-class"
    return "Assignment"
}

function DueStatus({ task }: { task: TaskListItem }) {
    if (task.status === "DRAFT") return <StatusBadge status="DRAFT" label="Draft" />
    if (task.status === "ARCHIVED") return <StatusBadge status="ARCHIVED" label="Archived" />

    const dueDate = new Date(task.dueDate)
    if (isToday(dueDate)) return <StatusBadge status="PENDING" label="Due today" />
    if (isPast(dueDate)) return <StatusBadge status="OVERDUE" label="Past due" />
    return <StatusBadge status="SUBMITTED" label="Scheduled" />
}

export function TaskManagementList({ assignments, courseId }: { assignments: TaskListItem[]; courseId: string }) {
    const [query, setQuery] = useState("")
    const [type, setType] = useState("ALL")

    const visibleAssignments = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()
        return assignments.filter((assignment) => {
            const matchesQuery = !normalizedQuery || assignment.title.toLowerCase().includes(normalizedQuery)
            const matchesType = type === "ALL" || assignment.type === type
            return matchesQuery && matchesType
        })
    }, [assignments, query, type])

    return (
        <div className="space-y-2">
            <WorkspaceToolbar className="justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                    <div className="relative min-w-0 flex-1 sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search tasks"
                            aria-label="Search tasks"
                            className="pl-8"
                        />
                    </div>
                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                        aria-label="Filter task type"
                        className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 sm:w-40"
                    >
                        <option value="ALL">All task types</option>
                        <option value="SUBMISSION">Assignments</option>
                        <option value="NON_SUBMISSION">In-class</option>
                        <option value="QUIZ">Quizzes</option>
                    </select>
                </div>
                <div className="text-xs text-muted-foreground" aria-live="polite">
                    {visibleAssignments.length} of {assignments.length} tasks
                </div>
            </WorkspaceToolbar>

            {visibleAssignments.length === 0 ? (
                <WorkspacePanel className="flex flex-col items-center px-4 py-10 text-center">
                    <ClipboardList className="mb-2 size-5 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">{assignments.length ? "No matching tasks" : "No tasks yet"}</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        {assignments.length ? "Try a different search or task type." : "Create the first task to start collecting and grading student work."}
                    </p>
                    {!assignments.length && (
                        <Button asChild size="sm" className="mt-3">
                            <Link href={`/teacher/courses/${courseId}/tasks/new`}>Create task</Link>
                        </Button>
                    )}
                </WorkspacePanel>
            ) : (
                <>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Due date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Points</TableHead>
                                    <TableHead className="text-right">Entries</TableHead>
                                    <TableHead className="w-32"><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {visibleAssignments.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell className="min-w-56 whitespace-normal">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{taskTypeLabel(task.type)}</Badge>
                                                {task.isExtraCredit && <StatusBadge status="ACTIVE" label="Extra credit" />}
                                            </div>
                                            <Link
                                                href={`/teacher/courses/${courseId}/tasks/${task.id}`}
                                                className="mt-1 block font-medium text-foreground hover:text-primary hover:underline"
                                            >
                                                {task.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Calendar className="size-3.5" />
                                                {format(new Date(task.dueDate), "MMM d, yyyy")}
                                            </div>
                                        </TableCell>
                                        <TableCell><DueStatus task={task} /></TableCell>
                                        <TableCell className="text-right tabular-nums">{task.maxPoints}</TableCell>
                                        <TableCell className="text-right tabular-nums">{task._count.submissions}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/teacher/courses/${courseId}/tasks/${task.id}`}>
                                                    Grade <ArrowRight className="size-3.5" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <WorkspacePanel className="divide-y overflow-hidden md:hidden">
                        {visibleAssignments.map((task) => (
                            <Link
                                key={task.id}
                                href={`/teacher/courses/${courseId}/tasks/${task.id}`}
                                className="block px-3 py-3 transition-colors hover:bg-[var(--workspace-row-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge variant="outline">{taskTypeLabel(task.type)}</Badge>
                                            <DueStatus task={task} />
                                        </div>
                                        <div className="mt-1.5 truncate font-medium">{task.title}</div>
                                    </div>
                                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="size-3.5" />{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                                    <span>{task.maxPoints} pts</span>
                                    <span>{task._count.submissions} entries</span>
                                </div>
                            </Link>
                        ))}
                    </WorkspacePanel>
                </>
            )}
        </div>
    )
}
