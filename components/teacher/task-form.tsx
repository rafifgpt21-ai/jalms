"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Trash2, ArrowLeft } from "lucide-react"
import { AssignmentType, IntelligenceType } from "@prisma/client"
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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
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

const INTELLIGENCE_LABELS: Record<IntelligenceType, string> = {
    LINGUISTIC: "Linguistic-Verbal",
    LOGICAL_MATHEMATICAL: "Logical-Mathematical",
    SPATIAL: "Visual-Spatial",
    BODILY_KINESTHETIC: "Bodily-Kinesthetic",
    MUSICAL: "Musical-Rhythmic",
    INTERPERSONAL: "Interpersonal",
    INTRAPERSONAL: "Intrapersonal",
    NATURALIST: "Naturalist",
    EXISTENTIAL: "Existential",
}

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.enum(["SUBMISSION", "NON_SUBMISSION"]),
    dueDate: z.string().optional(),
    maxPoints: z.coerce.number().min(0),
    isExtraCredit: z.boolean().default(false),
    latePenalty: z.coerce.number().min(0).max(100).default(0),
    intelligenceTypes: z.array(z.nativeEnum(IntelligenceType)).optional(),
})

interface TaskFormProps {
    courseId?: string
    initialData?: any // Assignment
    course?: any // Course with Subject
    assignment?: any // Legacy alias for initialData
}

export function TaskForm({ courseId, initialData, assignment, course }: TaskFormProps) {
    // Handle alias
    const data = initialData || assignment
    const effectiveCourseId = courseId || data?.courseId

    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const isEditMode = !!data

    // State for customizing intelligence types
    const [customizeIntelligence, setCustomizeIntelligence] = useState(false)

    // Determine default tags from course subject
    const subjectTags: IntelligenceType[] = course?.subject?.intelligenceTypes || []

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: data?.title || "",
            description: data?.description || "",
            type: data?.type || "SUBMISSION",
            maxPoints: data?.maxPoints || 100,
            isExtraCredit: data?.isExtraCredit || false,
            latePenalty: data?.latePenalty || 0,
            dueDate: data?.dueDate ? format(new Date(data.dueDate), "yyyy-MM-dd'T'HH:mm") : "",
            intelligenceTypes: data?.intelligenceTypes || [], // Initialize with saved tags
        },
    })

    // If editing and we have tags that differ from subject tags (or if we have tags and no subject), we might want to default "customize" to true
    // Logic: If assignment has tags, assume customized. If empty, rely on logic -> BUT empty array means "no override" usually?
    // Wait, requirement: "Assignment tags are optional overrides. If has no tags, inherits."
    // So if data.intelligenceTypes is valid and length > 0, we turn on customize.
    // If length is 0, we can assume it's inheriting (unless user explicitly cleared them, but for now 0 means inherit).

    useEffect(() => {
        if (data?.intelligenceTypes && data.intelligenceTypes.length > 0) {
            setCustomizeIntelligence(true)
        }
    }, [data])

    const watchType = form.watch("type")

    function onSubmit(values: z.infer<typeof formSchema>) {
        // If customization is OFF, send empty array (or undefined handled by backend?)
        // Backend logic: "stores tags". Profile calculation logic will check Assignment tags first.
        // If customization is turned OFF by user, we should clear the tags in the submission.
        // So if !customizeIntelligence, we set intelligenceTypes = []. 
        // Wait, if I send [], does backend treat it as "no override" or "no intelligences"?
        // Requirement: "If an assignment has no tags, it inherits from its subject."
        // So saving [] means "Inherit". That works.

        const intelligenceTypesPayload = customizeIntelligence ? values.intelligenceTypes : []

        startTransition(async () => {
            try {
                let result;

                if (isEditMode) {
                    result = await updateAssignment({
                        assignmentId: data.id,
                        title: values.title,
                        description: values.description,
                        type: values.type as AssignmentType,
                        dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
                        maxPoints: values.maxPoints,
                        isExtraCredit: values.isExtraCredit,
                        latePenalty: values.latePenalty,
                        intelligenceTypes: intelligenceTypesPayload,
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
                        intelligenceTypes: intelligenceTypesPayload,
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
                const result = await deleteAssignment(data.id)
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

                            {/* Intelligence Profiling Section */}
                            <div className="space-y-4 rounded-md border p-4">
                                <div className="flex flex-row items-center justify-between">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Intelligence Profile</FormLabel>
                                        <FormDescription>
                                            Tag this assignment with Multiple Intelligences for student learning profiles.
                                        </FormDescription>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={customizeIntelligence}
                                            onCheckedChange={setCustomizeIntelligence}
                                        />
                                        <span className="text-sm font-medium">Customize</span>
                                    </div>
                                </div>

                                {!customizeIntelligence ? (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        Using Subject Defaults:{" "}
                                        {subjectTags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {subjectTags.map(tag => (
                                                    <Badge key={tag} variant="secondary">
                                                        {INTELLIGENCE_LABELS[tag] || tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="italic">No subject tags set.</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <FormField
                                            control={form.control}
                                            name="intelligenceTypes"
                                            render={() => (
                                                <FormItem>
                                                    <ScrollArea className="h-[200px] border rounded-md p-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {Object.entries(INTELLIGENCE_LABELS).map(([key, label]) => (
                                                                <FormField
                                                                    key={key}
                                                                    control={form.control}
                                                                    name="intelligenceTypes"
                                                                    render={({ field }) => {
                                                                        return (
                                                                            <FormItem
                                                                                key={key}
                                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                                            >
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        checked={field.value?.includes(key as IntelligenceType)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            const current = field.value || []
                                                                                            return checked
                                                                                                ? field.onChange([...current, key])
                                                                                                : field.onChange(
                                                                                                    current.filter(
                                                                                                        (value) => value !== key
                                                                                                    )
                                                                                                )
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal cursor-pointer">
                                                                                    {label}
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        )
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>

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
                                        <Link href={isEditMode ? `/teacher/courses/${effectiveCourseId}/tasks/${data.id}` : `/teacher/courses/${effectiveCourseId}`}>
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
