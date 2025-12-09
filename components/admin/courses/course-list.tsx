"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { Course, User, Term, AcademicYear, Subject } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, MoreHorizontal, Search } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
        subject: Subject | null;
        _count: { students: number };
    })[]
    teachers: { id: string; name: string }[]
    terms: { id: string; academicYear: { name: string }; type: string; isActive: boolean }[]
    subjects: Subject[]
}

export function CourseList({ courses, teachers, terms, subjects }: CourseListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterValue, setFilterValue] = useState("")

    const router = useRouter()
    const searchParams = useSearchParams()
    const showAll = searchParams.get("showAll") === "true"

    function handleToggle(checked: boolean) {
        const params = new URLSearchParams(searchParams.toString())
        if (checked) {
            params.set("showAll", "true")
        } else {
            params.delete("showAll")
        }
        router.push(`?${params.toString()}`)
    }

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(filterValue.toLowerCase())
    )

    const handleSearch = () => {
        setFilterValue(searchQuery)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

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

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                <div className="flex-shrink-0">
                    <CourseModal teachers={teachers} terms={terms} subjects={subjects} />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                        <Switch
                            id="show-all"
                            checked={!showAll}
                            onCheckedChange={(checked) => handleToggle(!checked)}
                        />
                        <Label htmlFor="show-all">Active Courses</Label>
                    </div>
                    <div className="flex w-full sm:w-auto items-center space-x-2">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-9 w-full sm:w-[300px]"
                            />
                        </div>
                        <Button onClick={handleSearch} variant="secondary">Search</Button>
                    </div>
                </div>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead className="max-md:hidden">Teacher</TableHead>
                            <TableHead className="max-lg:hidden">Semester</TableHead>
                            <TableHead className="max-sm:hidden">Students</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCourses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">
                                        {course.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {course.subject?.name || "-"}
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
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CourseModal
                teachers={teachers}
                terms={terms}
                subjects={subjects}
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
