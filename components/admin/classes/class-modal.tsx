"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Class, Term, AcademicYear } from "@prisma/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClass, updateClass, getActiveTerms } from "@/lib/actions/class.actions"
import { toast } from "sonner"
import { Plus, Check, ChevronsUpDown } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(1, "Class name is required"),
    termId: z.string().min(1, "Semester is required"),
    homeroomTeacherId: z.string().optional(),
})

interface ClassModalProps {
    teachers: { id: string; name: string }[]
    terms: (Term & { academicYear: AcademicYear })[]
    initialData?: Class | null
    open?: boolean
    onOpenChange?: (open: boolean) => void
    showTrigger?: boolean
}

export function ClassModal({ teachers, terms, initialData, open: controlledOpen, onOpenChange, showTrigger = true }: ClassModalProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [teacherOpen, setTeacherOpen] = useState(false)
    const [extraTerms, setExtraTerms] = useState<(Term & { academicYear: AcademicYear })[]>([])

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = onOpenChange || setInternalOpen

    const allTerms = [...terms, ...extraTerms]
    // Deduplicate terms just in case
    const uniqueTerms = Array.from(new Map(allTerms.map(t => [t.id, t])).values())

    const activeTerm = uniqueTerms.find(t => t.isActive)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            termId: "",
            homeroomTeacherId: "",
        },
    })

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                termId: (initialData as any).termId, // Cast because initialData might be stale type
                homeroomTeacherId: initialData.homeroomTeacherId || "",
            })

            // Check if term exists in current list
            const termId = (initialData as any).termId
            const termExists = terms.some(t => t.id === termId)
            const extraTermExists = extraTerms.some(t => t.id === termId)

            if (termId && !termExists && !extraTermExists) {
                // Fetch the specific term
                getActiveTerms(termId).then(result => {
                    if (result.terms && result.terms.length > 0) {
                        setExtraTerms(prev => [...prev, result.terms[0] as any])
                    }
                })
            }
        } else {
            // Default to active term
            form.reset({
                name: "",
                termId: activeTerm?.id || "",
                homeroomTeacherId: "",
            })
        }
    }, [initialData, terms, activeTerm, form, extraTerms])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const payload = {
                name: values.name,
                termId: values.termId,
                homeroomTeacherId: values.homeroomTeacherId || undefined
            }

            let result
            if (initialData) {
                result = await updateClass(initialData.id, payload)
            } else {
                result = await createClass(payload)
            }

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(initialData ? "Class updated" : "Class created")
                setOpen(false)
                if (!initialData) form.reset()
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            {showTrigger && !initialData && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Class
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] overflow-visible">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Class" : "Add Class"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Update class details." : "Create a new class for the active semester."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 10 Science A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="termId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Semester</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? (() => {
                                                            const term = uniqueTerms.find(t => t.id === field.value)
                                                            return term ? `${term.academicYear.name} - ${term.type === "ODD" ? "Odd" : "Even"}` : "Select semester"
                                                        })()
                                                        : "Select semester"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search semester..." />
                                                <CommandList>
                                                    <CommandEmpty>No semester found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {uniqueTerms.map((term) => (
                                                            <CommandItem
                                                                value={`${term.academicYear.name} ${term.type}`}
                                                                key={term.id}
                                                                onSelect={() => {
                                                                    form.setValue("termId", term.id)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        term.id === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {term.academicYear.name} - {term.type === "ODD" ? "Odd" : "Even"} {term.isActive && "(Active)"}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="homeroomTeacherId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Homeroom Teacher</FormLabel>
                                    <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? teachers.find(
                                                            (teacher) => teacher.id === field.value
                                                        )?.name
                                                        : "Select teacher"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search teacher..." />
                                                <CommandList>
                                                    <CommandEmpty>No teacher found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {teachers.map((teacher) => (
                                                            <CommandItem
                                                                value={teacher.name}
                                                                key={teacher.id}
                                                                onSelect={() => {
                                                                    form.setValue("homeroomTeacherId", teacher.id)
                                                                    setTeacherOpen(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        teacher.id === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {teacher.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : (initialData ? "Save Changes" : "Create Class")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
