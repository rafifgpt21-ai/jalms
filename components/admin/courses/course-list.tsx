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
                <div className="shrink-0">
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
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <Input
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-9 w-full sm:w-[300px] bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 backdrop-blur-sm focus:bg-white/80 dark:focus:bg-slate-900/80 transition-all rounded-xl"
                            />
                        </div>
                        <Button onClick={handleSearch} variant="secondary" className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-xl">Search</Button>
                    </div>
                </div>
            </div>

            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/20 dark:bg-white/5 border-b border-white/10">
                        <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead className="text-slate-700 dark:text-slate-200 font-medium">Course Name</TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-200 font-medium">Subject</TableHead>
                            <TableHead className="max-md:hidden text-slate-700 dark:text-slate-200 font-medium">Teacher</TableHead>
                            <TableHead className="max-lg:hidden text-slate-700 dark:text-slate-200 font-medium">Semester</TableHead>
                            <TableHead className="max-sm:hidden text-slate-700 dark:text-slate-200 font-medium">Students</TableHead>
                            <TableHead className="text-right text-slate-700 dark:text-slate-200 font-medium">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32 text-slate-500 dark:text-slate-400">
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCourses.map((course) => (
                                <TableRow key={course.id} className="hover:bg-white/30 dark:hover:bg-white/5 border-b border-white/10 dark:border-white/5 transition-colors">
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-200">
                                        {course.name}
                                    </TableCell>
                                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                                        {course.subject?.name || "-"}
                                    </TableCell>
                                    <TableCell className="max-md:hidden text-slate-600 dark:text-slate-300">{course.teacher.name}</TableCell>
                                    <TableCell className="max-lg:hidden text-slate-600 dark:text-slate-300">
                                        {course.term.academicYear.name} - {course.term.type === "ODD" ? "Odd" : "Even"}
                                    </TableCell>
                                    <TableCell className="max-sm:hidden text-slate-600 dark:text-slate-300">
                                        {course._count.students}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild className="bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-lg h-8">
                                                <a href={`/admin/courses/${course.id}`}>Manage</a>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/40 dark:hover:bg-white/10 rounded-lg">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-white/10">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => {
                                                        setEditingCourse(course)
                                                        setIsModalOpen(true)
                                                    }}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(course.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
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
