"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { useUploadThing } from "@/lib/uploadthing"
import { createMaterial, updateMaterial, deleteMaterialFile } from "@/lib/actions/material.actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, X, FileText, Upload, Trash } from "lucide-react"
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

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    fileUrl: z.string().optional(), // Optional because we might be uploading a new one
})

interface MaterialFormProps {
    initialData?: {
        id: string
        title: string
        description?: string | null
        fileUrl: string
    }
}

export function MaterialForm({ initialData }: MaterialFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [existingFileUrl, setExistingFileUrl] = useState(initialData?.fileUrl || "")

    const { startUpload } = useUploadThing("courseAttachment")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            fileUrl: initialData?.fileUrl || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            let fileUrl = existingFileUrl

            // If a new file is selected, upload it first
            if (selectedFile) {
                const uploadRes = await startUpload([selectedFile])
                if (!uploadRes || !uploadRes[0]) {
                    throw new Error("Failed to upload file")
                }
                // Use ufsUrl if available (new version), otherwise fallback to url (deprecated) or appUrl
                // @ts-ignore - ufsUrl might not be in the type definition yet
                fileUrl = uploadRes[0].ufsUrl || uploadRes[0].url || uploadRes[0].appUrl
            }

            if (!fileUrl) {
                toast.error("Please upload a file")
                setIsSubmitting(false)
                return
            }

            let res;
            if (initialData) {
                res = await updateMaterial(
                    initialData.id,
                    values.title,
                    values.description || "",
                    fileUrl
                )
            } else {
                res = await createMaterial({
                    title: values.title,
                    description: values.description || "",
                    fileUrl
                })
            }

            if (res.success || res.material) {
                toast.success(initialData ? "Material updated" : "Material created")
                router.push(`/teacher/materials`)
            } else {
                toast.error(res.error || "Operation failed")
            }
        } catch (error) {
            console.error("Submission error:", error)
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== "application/pdf") {
                toast.error("Only PDF files are allowed")
                return
            }
            setSelectedFile(file)
            // Auto-fill title if empty
            if (!form.getValues("title")) {
                form.setValue("title", file.name.replace(".pdf", ""))
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Introduction to Biology" {...field} />
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
                                <Textarea
                                    placeholder="Brief description of the material..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel>Material File (PDF only)</FormLabel>
                    <FormControl>
                        <div className="space-y-4">
                            {existingFileUrl && !selectedFile && (
                                <div className="flex items-center gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
                                    <FileText className="h-8 w-8 text-blue-500" />
                                    <div className="flex-1 truncate text-sm">
                                        <a href={existingFileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            Current File
                                        </a>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Trash className="h-4 w-4 mr-2" />
                                                )}
                                                Remove current file
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the file from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={async (e) => {
                                                        // Prevent dialog from closing immediately if we want to show loading state
                                                        // But AlertDialogAction closes automatically. 
                                                        // For better UX with async, we might want to handle it differently, 
                                                        // but standard usage is fine for now.

                                                        setIsSubmitting(true)
                                                        try {
                                                            if (initialData?.id) {
                                                                const res = await deleteMaterialFile(initialData.id, existingFileUrl)
                                                                if (res.success) {
                                                                    setExistingFileUrl("")
                                                                    toast.success("File deleted successfully")
                                                                } else {
                                                                    toast.error(res.error || "Failed to delete file")
                                                                }
                                                            } else {
                                                                setExistingFileUrl("")
                                                            }
                                                        } catch (error) {
                                                            console.error(error)
                                                            toast.error("Something went wrong")
                                                        } finally {
                                                            setIsSubmitting(false)
                                                        }
                                                    }}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}

                            {(!existingFileUrl || selectedFile) && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                </div>
                            )}

                            {selectedFile && (
                                <p className="text-sm text-muted-foreground">
                                    Selected: {selectedFile.name}
                                </p>
                            )}
                        </div>
                    </FormControl>
                    <FormDescription>
                        Upload the study material file. Only PDF files are allowed.
                    </FormDescription>
                    <FormMessage />
                </FormItem>

                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Material" : "Create Material"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
