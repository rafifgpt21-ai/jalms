"use client"

import { Class, User, Term, AcademicYear } from "@prisma/client"
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
import { deleteClass } from "@/lib/actions/class.actions"
import { toast } from "sonner"
import { ClassModal } from "./class-modal"
import { Badge } from "@/components/ui/badge"
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

interface ClassListProps {
    classes: (Class & {
        term: Term & { academicYear: AcademicYear };
        homeroomTeacher: User | null;
        _count: { students: number };
    })[]
    teachers: { id: string; name: string }[]
    terms: (Term & { academicYear: AcademicYear })[]
}

export function ClassList({ classes, teachers, terms }: ClassListProps) {
    const [editingClass, setEditingClass] = useState<Class | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showActiveOnly, setShowActiveOnly] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const filteredClasses = showActiveOnly
        ? classes.filter(cls => cls.term.isActive)
        : classes

    async function handleDelete(id: string) {
        setDeleteId(id)
    }

    async function confirmDelete() {
        if (!deleteId) return

        const result = await deleteClass(deleteId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Class deleted")
        }
        setDeleteId(null)
    }

    if (classes.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No classes found.</p>
            </div>
        )
    }

    return (
        <>
            <div className="flex items-center space-x-2 mb-4">
                <Switch
                    id="active-filter"
                    checked={showActiveOnly}
                    onCheckedChange={setShowActiveOnly}
                />
                <Label htmlFor="active-filter">Show Active Semester Only</Label>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead>Homeroom Teacher</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClasses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No classes found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClasses.map((cls) => (
                                <TableRow key={cls.id}>
                                    <TableCell className="font-medium">{cls.name}</TableCell>
                                    <TableCell>
                                        {cls.term.academicYear.name} - {cls.term.type === "ODD" ? "Odd" : "Even"}
                                    </TableCell>
                                    <TableCell>
                                        {cls.homeroomTeacher ? (
                                            cls.homeroomTeacher.name
                                        ) : (
                                            <span className="text-gray-400 italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {cls._count.students} Students
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/admin/classes/${cls.id}`}>Manage</a>
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
                                                        setEditingClass(cls)
                                                        setIsModalOpen(true)
                                                    }}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(cls.id)} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>

            <ClassModal
                teachers={teachers}
                terms={terms}
                initialData={editingClass}
                open={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open)
                    if (!open) setEditingClass(null)
                }}
                showTrigger={false}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the class and remove all associated data.
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
        </>
    )
}
