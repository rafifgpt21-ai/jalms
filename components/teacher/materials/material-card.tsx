"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { FileText, MoreVertical, Eye, Download, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { deleteMaterial } from "@/lib/actions/material.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ManageMaterialDialog } from "./manage-material-dialog"

interface MaterialCardProps {
    material: {
        id: string
        title: string
        description?: string | null
        fileUrl: string
        uploadedAt: Date
        courseId?: string | null // Made optional as per schema change
        assignments?: any[] // Using any for simplicity or define proper type
    }
    isTeacher?: boolean
    courseId?: string
}

export function MaterialCard({ material, isTeacher = false, courseId }: MaterialCardProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleDelete() {
        setIsDeleting(true)
        try {
            const res = await deleteMaterial(material.id)
            if (res.success) {
                toast.success("Material deleted")
                router.refresh()
            } else {
                toast.error("Failed to delete material")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsDeleting(false)
        }
    }

    const viewUrl = isTeacher
        ? `/teacher/materials/${material.id}`
        : `/student/courses/${courseId || material.courseId}/materials/${material.id}`

    // If teacher, we might not have a specific courseId for the view link if it's global.
    // But for now let's keep it simple. If it's teacher, maybe just show file?
    // User said "same download and view menu". 
    // If I click view, where does it go?
    // Maybe just open the file?
    // For now I'll point to fileUrl for teacher if courseId is missing.

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-base font-semibold leading-none">
                            <Link href={viewUrl} className="hover:underline">
                                {material.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Uploaded on {format(new Date(material.uploadedAt), "MMM d, yyyy")}
                        </CardDescription>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={viewUrl}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`${material.fileUrl}?download=true`} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </DropdownMenuItem>
                        {isTeacher && (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={
                                            material.courseId
                                                ? `/teacher/courses/${material.courseId}/materials/${material.id}/edit`
                                                : `/teacher/materials/${material.id}/edit`
                                        }
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the study material.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {material.description || "No description provided."}
                </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {isTeacher && (
                    <ManageMaterialDialog
                        materialId={material.id}
                        materialTitle={material.title}
                        assignments={material.assignments || []}
                    />
                )}
                <Button variant="outline" size="sm" asChild>
                    <Link href={viewUrl}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                    </Link>
                </Button>
                <Button size="sm" asChild>
                    <a href={`${material.fileUrl}?download=true`} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </a>
                </Button>
            </CardFooter>
        </Card>
    )
}
