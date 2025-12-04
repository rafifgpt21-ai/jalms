"use client"

import { Course, User, Term, AcademicYear } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { deleteCourse } from "@/lib/actions/course.actions"
import { toast } from "sonner"
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

import { CourseModal } from "./course-modal"

interface CourseListProps {
    courses: (Course & {
        teacher: User;
        term: Term & { academicYear: AcademicYear };
        _count: { students: number };
    })[]
    teachers: { id: string; name: string }[]
    terms: { id: string; academicYear: { name: string }; type: string; isActive: boolean }[]
}

export function CourseList({ courses, teachers, terms }: CourseListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    async function handleDelete(id: string) {
        setDeleteId(id)
    }

    async function confirmDelete() {
        if (!deleteId) return

        const result = await deleteCourse(deleteId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Course deleted")
        }
        setDeleteId(null)
    }

    if (courses.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No courses found.</p>
            </div>
        )
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="max-md:hidden">Teacher</TableHead>
                        <TableHead className="max-lg:hidden">Semester</TableHead>
                        <TableHead className="max-sm:hidden">Students</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                        <TableRow key={course.id}>
                            <TableCell className="font-medium">
                                {course.name}
                            </TableCell>
                            <TableCell className="max-md:hidden">{course.teacher.name}</TableCell>
                            <TableCell className="max-lg:hidden">
                                {course.term.academicYear.name} - {course.term.type === "ODD" ? "Odd" : "Even"}
                            </TableCell>
                            <TableCell className="max-sm:hidden">
                                {course._count.students}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/admin/courses/${course.id}`}>Manage</a>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => {
                                                setEditingCourse(course)
                                                setIsModalOpen(true)
                                            }}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(course.id)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <CourseModal
                teachers={teachers}
                terms={terms}
                initialData={editingCourse}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                showTrigger={false}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the course and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
