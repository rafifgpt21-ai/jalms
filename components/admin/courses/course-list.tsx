"use client"

import { useRouter, useSearchParams } from "next/navigation"

import { Course, User, Term, AcademicYear, Subject, Class } from "@prisma/client"
import { CourseIdentityBadge } from "@/components/course/course-identity-badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
        class: Class | null;
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
    const [subjectFilter, setSubjectFilter] = useState("all")
    const [classFilter, setClassFilter] = useState("all")
    const [teacherFilter, setTeacherFilter] = useState("all")

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

    const filteredCourses = courses.filter(course => {
        const query = filterValue.toLowerCase()
        const matchesSearch = !query || [course.name, course.subject?.name, course.subject?.code, course.class?.name, course.teacher.name].some(value => value?.toLowerCase().includes(query))
        return matchesSearch &&
            (subjectFilter === "all" || (subjectFilter === "unlinked" ? !course.subjectId : course.subjectId === subjectFilter)) &&
            (classFilter === "all" || (classFilter === "unlinked" ? !course.classId : course.classId === classFilter)) &&
            (teacherFilter === "all" || course.teacherId === teacherFilter)
    })
    const classes = Array.from(new Map(courses.flatMap(course => course.class ? [[course.class.id, course.class] as const] : [])).values())

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
            <div className="admin-toolbar">
                <div className="w-full shrink-0 sm:w-auto [&_[data-slot=button]]:w-full sm:[&_[data-slot=button]]:w-auto">
                    <CourseModal teachers={teachers} terms={terms} subjects={subjects} />
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
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
                                onChange={(e) => { setSearchQuery(e.target.value); setFilterValue(e.target.value) }}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-9 sm:w-[300px]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-filter-grid">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}><SelectTrigger className="h-8 w-[170px]"><SelectValue placeholder="Subject" /></SelectTrigger><SelectContent><SelectItem value="all">All subjects</SelectItem><SelectItem value="unlinked">No subject</SelectItem>{subjects.map(subject => <SelectItem key={subject.id} value={subject.id}>{subject.code} · {subject.name}</SelectItem>)}</SelectContent></Select>
                <Select value={classFilter} onValueChange={setClassFilter}><SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Class" /></SelectTrigger><SelectContent><SelectItem value="all">All classes</SelectItem><SelectItem value="unlinked">No linked class</SelectItem>{classes.map(cls => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}</SelectContent></Select>
                <Select value={teacherFilter} onValueChange={setTeacherFilter}><SelectTrigger className="h-8 w-[170px]"><SelectValue placeholder="Teacher" /></SelectTrigger><SelectContent><SelectItem value="all">All teachers</SelectItem>{teachers.map(teacher => <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>)}</SelectContent></Select>
                <span className="admin-filter-summary">Showing {filteredCourses.length} of {courses.length} courses</span>
            </div>

            <div className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Course Name</TableHead>
                            <TableHead className="max-md:hidden">Subject / Class</TableHead>
                            <TableHead className="max-md:hidden">Teacher</TableHead>
                            <TableHead className="max-lg:hidden">Semester</TableHead>
                            <TableHead className="max-sm:hidden">Students</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-200">
                                        <div className="flex items-center gap-3">
                                            <CourseIdentityBadge course={{ ...course, roleContext: "teacher" }} className="size-9 rounded-lg" />
                                            <div className="min-w-0">
                                                <div className="truncate">{course.name}</div>
                                                <div className="text-xs font-normal text-muted-foreground">{course.enrollmentMode?.replace("_", " ").toLowerCase() || "manual"}</div>
                                                <div className="mt-0.5 truncate text-xs font-normal text-muted-foreground md:hidden">
                                                    {course.subject?.code || "No subject"} · {course.class?.name || "No linked class"}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-md:hidden text-slate-500 dark:text-slate-400 text-sm">
                                        <div>{course.subject ? `${course.subject.code} · ${course.subject.name}` : "No subject"}</div>
                                        <div className="text-xs text-muted-foreground">{course.class?.name || "No linked class"}</div>
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
                                            <Button variant="outline" size="sm" asChild className="max-sm:px-2.5">
                                                <a href={`/admin/courses/${course.id}`}>Manage</a>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
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
