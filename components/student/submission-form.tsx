"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Editor } from "@/components/ui/editor"
import { Label } from "@/components/ui/label"
import { submitAssignment, deleteSubmissionFile } from "@/lib/actions/student.actions"
import { Loader2, Paperclip, FileText, Trash, Link as LinkIcon, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { useLocalUpload } from "@/hooks/use-local-upload"

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

interface SubmissionFormProps {
    assignmentId: string
    initialUrl?: string
    initialAttachmentUrl?: string
    initialLink?: string
    isLate?: boolean
}

export function SubmissionForm({ assignmentId, initialUrl, initialAttachmentUrl, initialLink, isLate }: SubmissionFormProps) {
    const [url, setUrl] = useState(initialUrl || "")
    const [attachmentUrl, setAttachmentUrl] = useState(initialAttachmentUrl || "")
    const [link, setLink] = useState(initialLink || "")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showLateConfirmation, setShowLateConfirmation] = useState(false)


    const { startUpload, isUploading } = useLocalUpload()

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!url && !attachmentUrl && !selectedFile && !link) return

        if (isLate) {
            setShowLateConfirmation(true)
        } else {
            submit()
        }
    }

    const submit = async () => {
        const toastId = toast.loading("Submitting assignment...")
        setIsSubmitting(true)
        try {
            let finalAttachmentUrl = attachmentUrl

            // 1. Upload file if selected
            if (selectedFile) {
                toast.loading("Uploading file...", { id: toastId })
                const res = await startUpload([selectedFile], "tasks")
                if (res && res[0]) {
                    finalAttachmentUrl = res[0].url
                } else {
                    throw new Error("Failed to upload file")
                }
            }

            // 2. Submit assignment
            toast.loading("Saving submission...", { id: toastId })
            const res = await submitAssignment(assignmentId, url, finalAttachmentUrl, link)
            if (res.error) {
                toast.error(res.error, { id: toastId })
            } else {
                toast.success("Assignment submitted successfully!", { id: toastId })
                setShowLateConfirmation(false)
                // Clear selected file after successful submission
                setSelectedFile(null)
                setAttachmentUrl(finalAttachmentUrl)
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong", { id: toastId })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            if (file.size > 1 * 1024 * 1024) {
                toast.error("File is too large. Max 1MB allowed.")
                e.target.value = "" // Reset input
                return
            }

            setSelectedFile(file)
        }
    }

    const handleRemoveFile = async () => {
        if (selectedFile) {
            setSelectedFile(null)
            const fileInput = document.getElementById("file-upload") as HTMLInputElement
            if (fileInput) fileInput.value = ""
            return
        }

        if (attachmentUrl) {
            const toastId = toast.loading("Removing file...")

            // Optimistic update
            const urlToDelete = attachmentUrl
            setAttachmentUrl("")

            try {
                // Call server action to delete from UT and DB
                const res = await deleteSubmissionFile(assignmentId, urlToDelete)
                if (res.error) {
                    toast.error("Failed to delete file", { id: toastId })
                    // Revert optimistic update if needed, but for now let's prioritize UI responsiveness
                } else {
                    toast.success("File removed", { id: toastId })
                }
            } catch (e) {
                toast.error("Error removing file", { id: toastId })
                console.error(e)
            }
        }
    }

    return (
        <>
            <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* ... existing content ... */}

                <div className="space-y-2">
                    <Label>Submission Content</Label>
                    <Editor
                        value={url}
                        onChange={setUrl}
                    />
                    <p className="text-xs text-gray-500">
                        Write your submission content here.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Link (Optional)</Label>
                    <Input
                        placeholder="https://..."
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500">
                        Add a link to your work (e.g. Google Drive, YouTube, etc.)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Attachment (Optional)</Label>

                    {/* Show if NO file is selected AND NO existing attachment */}
                    {!selectedFile && !attachmentUrl && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmitting}
                                onClick={() => document.getElementById("file-upload")?.click()}
                                className="w-full"
                            >
                                <Paperclip className="mr-2 h-4 w-4" />
                                Attach File (PDF, DOCX - Max 1MB)
                            </Button>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx,.doc"
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    {/* Show if file IS selected OR existing attachment exists */}
                    {(selectedFile || attachmentUrl) && (
                        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-medium truncate">
                                        {selectedFile ? selectedFile.name : "Attached File"}
                                    </span>
                                    {selectedFile && (
                                        <span className="text-xs text-amber-600 font-medium">
                                            Pending Upload
                                        </span>
                                    )}
                                    {!selectedFile && attachmentUrl && (
                                        <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline">
                                            View File
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => document.getElementById("file-upload")?.click()}
                                    className="text-muted-foreground hover:text-foreground"
                                    disabled={isSubmitting}
                                    title="Replace File"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    disabled={isSubmitting}
                                    title="Remove File"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.docx,.doc"
                                    onChange={handleFileChange}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={isSubmitting || (!url && !attachmentUrl && !selectedFile && !link)} className="w-full">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isUploading ? "Uploading File..." : "Submitting..."}
                        </>
                    ) : (
                        initialUrl || initialAttachmentUrl ? "Update Submission" : "Submit Assignment"
                    )}
                </Button>

                {isLate && (
                    <p className="text-xs text-red-500 text-center">
                        Note: This submission will be marked as Late.
                    </p>
                )}
            </form>

            <AlertDialog open={showLateConfirmation} onOpenChange={setShowLateConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Late Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                            This assignment is past its due date. Submitting now will mark it as <strong>Late</strong>.
                            {(initialUrl || initialAttachmentUrl) && " Any previous grade might be affected."}
                            <br /><br />
                            Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={submit}>
                            Yes, Submit Late
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
