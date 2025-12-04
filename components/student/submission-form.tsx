"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Editor } from "@/components/ui/editor"
import { Label } from "@/components/ui/label"
import { submitAssignment, deleteSubmissionFile } from "@/lib/actions/student.actions"
import { Loader2, Paperclip, FileText, Trash, Link as LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { useUploadThing } from "@/lib/uploadthing"

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
    const { toast } = useToast()

    const { startUpload, isUploading } = useUploadThing("assignmentSubmission", {
        onClientUploadComplete: (res) => {
            // This is now handled manually in the submit function, 
            // but we can leave this empty or use it for logging.
        },
        onUploadError: (error: Error) => {
            toast({
                title: "Upload failed",
                description: error.message,
                variant: "destructive",
            })
        },
    })

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
        setIsSubmitting(true)
        try {
            let finalAttachmentUrl = attachmentUrl

            // 1. Upload file if selected
            if (selectedFile) {
                const res = await startUpload([selectedFile])
                if (res && res[0]) {
                    finalAttachmentUrl = res[0].url
                } else {
                    throw new Error("Failed to upload file")
                }
            }

            // 2. Submit assignment
            const res = await submitAssignment(assignmentId, url, finalAttachmentUrl, link)
            if (res.error) {
                toast({
                    title: "Error",
                    description: res.error,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Success",
                    description: "Assignment submitted successfully!",
                })
                setShowLateConfirmation(false)
                // Clear selected file after successful submission
                setSelectedFile(null)
                setAttachmentUrl(finalAttachmentUrl)
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setSelectedFile(file)
            // If we are replacing an existing file, we might want to clear the old URL from view?
            // Or just keep it until the new one is uploaded. 
            // Let's keep the old one in state but show the new pending file in UI.
        }
    }

    const handleRemoveFile = async () => {
        if (selectedFile) {
            setSelectedFile(null)
            // Reset file input value if needed, but since we hide it, it's fine.
            // Actually, we should probably reset the input value to allow re-selecting same file.
            const fileInput = document.getElementById("file-upload") as HTMLInputElement
            if (fileInput) fileInput.value = ""
            return
        }

        if (attachmentUrl) {
            // Optimistic update
            const urlToDelete = attachmentUrl
            setAttachmentUrl("")

            toast({
                title: "Removing file...",
                description: "Please wait while we remove the file.",
            })

            try {
                // Call server action to delete from UT and DB
                const res = await deleteSubmissionFile(assignmentId, urlToDelete)
                if (res.error) {
                    toast({
                        title: "Error",
                        description: "Failed to delete file from server, but removed from view.",
                        variant: "destructive"
                    })
                } else {
                    toast({
                        title: "File removed",
                        description: "The file has been deleted successfully.",
                    })
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    return (
        <>
            <form onSubmit={handleFormSubmit} className="space-y-4">
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
                                Attach File (PDF, DOCX - Max 2MB)
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
                                <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
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
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveFile}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                disabled={isSubmitting}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
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
