import { getStudentReportCard } from "@/lib/actions/homeroom.actions"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { ReportPreviewBridge } from "@/components/homeroom/report-preview-bridge"

export const dynamicApi = 'force-dynamic'

interface PageProps {
    params: Promise<{
        classId: string
        studentId: string
    }>
}

export default async function ReportPreviewPage(props: PageProps) {
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
        error
    } = await getStudentReportCard(studentId, classId)

    if (error || !student || !classData || !courses) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-lg">Error: {error || "Failed to load report card data"}</div>
    }

    return (
        <>
            <MobileHeaderSetter title={`Preview: ${student.name}`} />
            <ReportPreviewBridge
                student={student}
                classData={classData}
                courses={courses}
                extracurriculars={extracurriculars || []}
                achievements={achievements || []}
                development={development || []}
                attendance={attendance || { sick: 0, excused: 0, alpha: 0 }}
                homeroomTeacherNote={homeroomTeacherNote || ""}
                principalName={principalName || ""}
                classId={classId}
                studentId={studentId}
            />
        </>
    )
}
