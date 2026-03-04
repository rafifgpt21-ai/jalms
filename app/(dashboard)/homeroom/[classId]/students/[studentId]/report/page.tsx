import { getStudentReportCard } from "@/lib/actions/homeroom.actions"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ReportCardForm } from "@/components/homeroom/report-card-form"

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{
        classId: string
        studentId: string
    }>
}

export default async function ReportCardPage(props: PageProps) {
    const params = await props.params;

    const { classId, studentId } = params;

    const {
        student,
        classData,
        courses,
        extracurriculars,
        achievements,
        development,
        attendance,
        homeroomTeacherNote,
        principalName,
        isSnapshot,
        gradingScale,
        generatedAt,
        calculatedAttendance,
        error
    } = await getStudentReportCard(studentId, classId)

    if (error || !student || !classData || !courses) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-lg">Error: {error || "Failed to load report card data"}</div>
    }

    return (
        <div className="space-y-6 w-full mx-auto pb-20 p-4 sm:p-6 lg:p-8">
            <MobileHeaderSetter title={`Report Card: ${student.name}`} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Button variant="ghost" asChild className="pl-0 hover:pl-2">
                    <Link href={`/homeroom/${classId}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Class
                    </Link>
                </Button>
            </div>

            <ReportCardForm
                student={student}
                classData={classData}
                courses={courses}
                extracurriculars={extracurriculars || []}
                achievements={achievements || []}
                development={development || []}
                attendance={attendance || { sick: 0, excused: 0, alpha: 0 }}
                homeroomTeacherNote={homeroomTeacherNote || ""}
                principalName={principalName || ""}
                isSnapshot={isSnapshot || false}
                gradingScale={gradingScale || []}
                calculatedAttendance={calculatedAttendance}
            />
        </div>
    )
}
