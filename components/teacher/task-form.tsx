"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Trash2, ArrowLeft } from "lucide-react"
import { AssignmentType } from "@prisma/client"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Editor } from "@/components/ui/editor"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { createAssignment, updateAssignment, deleteAssignment } from "@/lib/actions/teacher.actions"

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.enum(["SUBMISSION", "NON_SUBMISSION"]),
    dueDate: z.string().optional(),
    maxPoints: z.coerce.number().min(0),
    isExtraCredit: z.boolean().default(false),
    latePenalty: z.coerce.number().min(0).max(100).default(0),
})

interface TaskFormProps {
    courseId?: string
    assignment?: any // If provided, we are in EDIT mode
}

export function TaskForm({ courseId, assignment }: TaskFormProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const isEditMode = !!assignment

    // If in edit mode, use the assignment's courseId for the "back" link
    const effectiveCourseId = courseId || assignment?.courseId

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: assignment?.title || "",
            description: assignment?.description || "",
            type: assignment?.type || "SUBMISSION",
            maxPoints: assignment?.maxPoints || 100,
            isExtraCredit: assignment?.isExtraCredit || false,
            latePenalty: assignment?.latePenalty || 0,
            dueDate: assignment?.dueDate ? format(new Date(assignment.dueDate), "yyyy-MM-dd'T'HH:mm") : "",
        },
    })

    const watchType = form.watch("type")

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                let result;

                if (isEditMode) {
                    result = await updateAssignment({
                        assignmentId: assignment.id,
                        title: values.title,
                        description: values.description,
                        type: values.type as AssignmentType,
                        dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
                        maxPoints: values.maxPoints,
                        isExtraCredit: values.isExtraCredit,
                        latePenalty: values.latePenalty,
                    })
                } else {
                    if (!effectiveCourseId) {
                        toast.error("Course ID is missing")
                        return
                    }
                    result = await createAssignment({
                        courseId: effectiveCourseId,
                        title: values.title,
                        description: values.description,
                        type: values.type as AssignmentType,
                        dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
                        maxPoints: values.maxPoints,
                        isExtraCredit: values.isExtraCredit,
                        latePenalty: values.latePenalty,
                    })
                }

                if (result?.error) {
                    toast.error(result.error)
                } else if (result?.assignment) {
                    toast.success(isEditMode ? "Task updated successfully" : "Task created successfully")
                    router.push(`/teacher/courses/${effectiveCourseId}/tasks/${result.assignment.id}`)
                    router.refresh()
                } else {
                    toast.error("Unexpected response from server")
                }
            } catch (error) {
                console.error("Error in onSubmit:", error)
                toast.error("Something went wrong")
            }
        })
    }

    const handleDelete = async () => {
        startTransition(async () => {
            try {
                const result = await deleteAssignment(assignment.id)
                if (result.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Task deleted successfully")
                    router.push(`/teacher/courses/${result.courseId}`)
                    router.refresh()
                }
            } catch (error) {
                toast.error("Failed to delete task")
            }
        })
    }

    return (
        <div className="max-w-4xl mx-auto">


            <Card>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Chapter 1 Quiz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Editor
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                className="min-h-[200px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="SUBMISSION">Submission</SelectItem>
                                                    <SelectItem value="NON_SUBMISSION">Non-Submission</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="maxPoints"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Points</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {watchType === "SUBMISSION" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Due Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="latePenalty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Late Penalty (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" max="100" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Percentage deducted if submitted late (0-100).
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="isExtraCredit"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Extra Credit
                                            </FormLabel>
                                            <FormDescription>
                                                Check this box if this task is for extra credit.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-between pt-4 border-t">
                                {isEditMode ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" type="button" disabled={isPending}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Task
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the assignment and all associated submissions.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <div /> // Spacer
                                )}

                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={isEditMode ? `/teacher/courses/${effectiveCourseId}/tasks/${assignment.id}` : `/teacher/courses/${effectiveCourseId}`}>
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isEditMode ? "Save Changes" : "Create Task"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
