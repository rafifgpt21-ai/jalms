import { notFound } from "next/navigation"
import { db as prisma } from "@/lib/db"
import { getEnrolledStudents } from "@/lib/actions/enrollment.actions"
import { StudentList } from "@/components/admin/classes/student-list"
import { AddStudentModal } from "@/components/admin/classes/add-student-modal"
import { AddClassToClassModal } from "@/components/admin/classes/add-class-to-class-modal"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ClassWorkspacePageProps {
    params: {
        id: string
    }
}

export default async function ClassWorkspacePage({ params }: ClassWorkspacePageProps) {
    const { id } = await params

    const classData = await prisma.class.findUnique({
        where: { id },
        include: {
            term: {
                include: { academicYear: true }
            },
            homeroomTeacher: true
        }
    })

    if (!classData) {
        notFound()
    }

    const { students, error } = await getEnrolledStudents(id)

    if (error) {
        return <div className="p-6 text-red-500">Error loading students: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/classes">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{classData.name}</h1>
                    <p className="text-muted-foreground">
                        {classData.term.academicYear.name} - {classData.term.type === "ODD" ? "Odd" : "Even"}
                        {classData.homeroomTeacher && ` • Homeroom: ${classData.homeroomTeacher.name}`}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Enrolled Students ({students?.length || 0})</h2>
                <div className="flex gap-2">
                    <AddClassToClassModal classId={id} />
                    <AddStudentModal classId={id} />
                </div>
            </div>

            <StudentList classId={id} students={students || []} />
        </div>
    )
}
