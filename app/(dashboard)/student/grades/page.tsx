import { Suspense } from "react"
import { getStudentGrades, getStudentSemesters, getStudentGradeHistory } from "@/lib/actions/student.actions"
import { SemesterSelector } from "@/components/student/grades/semester-selector"
import { GradeStatistics } from "@/components/student/grades/grade-statistics"
import { GradesTable } from "@/components/student/grades/grades-table"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const GradeHistoryChart = dynamic(
    () => import("@/components/student/grades/grade-history-chart"),
    { loading: () => <Skeleton className="h-[284px] w-full rounded-xl" /> }
)

async function GradesContent({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const termId = typeof resolvedSearchParams.termId === 'string' ? resolvedSearchParams.termId : undefined

    const [gradesRes, semestersRes, historyRes] = await Promise.all([
        getStudentGrades(termId),
        getStudentSemesters(),
        getStudentGradeHistory()
    ])

    if ('error' in gradesRes || 'error' in semestersRes || 'error' in historyRes) {
        return <div>Error loading grades data</div>
    }

    const { grades } = gradesRes
    const { semesters } = semestersRes
    const { history } = historyRes

    // Determine display title for the table
    let semesterTitle = "Active Semester"
    if (termId === 'all') {
        semesterTitle = "All History"
    } else if (termId) {
        const selectedSemester = semesters.find(s => s.id === termId)
        if (selectedSemester) {
            semesterTitle = `${selectedSemester.academicYear.name} ${selectedSemester.type}`
        }
    }

    return <>
            <GradeHistoryChart history={history} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SemesterSelector semesters={semesters} />
            </div>

            <GradeStatistics grades={grades} />

            <GradesTable grades={grades} semesterTitle={semesterTitle} />
    </>
}

function GradesContentSkeleton() {
    return <div className="space-y-6" aria-label="Loading grades" aria-busy="true">
        <Skeleton className="h-[284px] w-full rounded-xl" />
        <Skeleton className="h-9 w-52" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 w-full rounded-xl" />)}</div>
        <Skeleton className="h-[28rem] w-full rounded-xl" />
    </div>
}

export default function StudentGradesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    return <div className="space-y-6">
        <MobileHeaderSetter title="My Grades" subtitle="Progress, statistics, and grade history." />
        <Suspense fallback={<GradesContentSkeleton />}><GradesContent searchParams={searchParams} /></Suspense>
    </div>
}
