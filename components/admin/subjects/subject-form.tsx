"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IntelligenceType } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { createSubject, updateSubject } from "@/lib/actions/subject.actions"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    description: z.string().optional(),
    intelligenceTypes: z.array(z.nativeEnum(IntelligenceType)),
})

interface SubjectFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: any // Subject
}

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

export function SubjectForm({ open, onOpenChange, initialData }: SubjectFormProps) {
    const [isPending, setIsPending] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            code: "",
            description: "",
            intelligenceTypes: [],
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                code: initialData.code,
                description: initialData.description || "",
                intelligenceTypes: initialData.intelligenceTypes || [],
            })
        } else {
            form.reset({
                name: "",
                code: "",
                description: "",
                intelligenceTypes: [],
            })
        }
    }, [initialData, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(true)
        try {
            let result
            if (initialData) {
                result = await updateSubject(initialData.id, values)
            } else {
                result = await createSubject(values)
            }

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(initialData ? "Subject updated" : "Subject created")
                onOpenChange(false)
                if (!initialData) form.reset()
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Subject" : "Create Subject"}</DialogTitle>
                    <DialogDescription>
                        Manage subject details and associated intelligence types.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Mathematics" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="MATH" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Optional description..." className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="intelligenceTypes"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Multiple Intelligences</FormLabel>
                                        <FormDescription>
                                            Select the primary intelligences associated with this subject.
                                        </FormDescription>
                                    </div>
                                    <ScrollArea className="h-[200px] border rounded-md p-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {Object.entries(INTELLIGENCE_LABELS).map(([key, label]) => (
                                                <FormItem
                                                    key={key}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(key as IntelligenceType)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), key])
                                                                    : field.onChange(
                                                                        (field.value || []).filter(
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
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Save Changes" : "Create Subject"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
