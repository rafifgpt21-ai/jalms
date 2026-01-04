import { getStudentReportCard } from "@/lib/actions/homeroom.actions"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { ReportCardDownloadButton } from "@/components/homeroom/report-card-download-button"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { numberToIndonesianText } from "@/lib/utils/number-to-text"

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

    const { student, classData, courses, error } = await getStudentReportCard(studentId, classId)

    if (error || !student || !classData || !courses) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-lg">Error: {error || "Failed to load report card data"}</div>
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <MobileHeaderSetter title="Student Report Card" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Button variant="ghost" asChild className="pl-0 hover:pl-2">
                    <Link href={`/homeroom/${classId}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Class
                    </Link>
                </Button>

                <div className="flex gap-2">
                    <ReportCardDownloadButton
                        student={student}
                        classData={classData}
                        courses={courses}
                    />
                </div>
            </div>

            {/* Web Preview - Redesigned to Match Indonesian Format */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-10 md:p-16 rounded-sm min-h-[800px] text-slate-900 dark:text-slate-100 print:shadow-none print:border-none font-sans">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-xl font-bold uppercase tracking-wide mb-1">LAPORAN HASIL BELAJAR</h1>
                    <h2 className="text-lg font-bold uppercase tracking-wide">SEMESTER {classData.term.type === 'ODD' ? '1 (SATU)' : '2 (DUA)'}</h2>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-2 mb-8 text-sm">
                    <div className="space-y-1">
                        <div className="flex">
                            <span className="w-32 font-bold">Nama</span>
                            <span className="px-2">:</span>
                            <span className="font-medium uppercase">{student.name}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 font-bold">Nomor Induk</span>
                            <span className="px-2">:</span>
                            <span>{student.officialId || '-'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 font-bold">Nama Sekolah</span>
                            <span className="px-2">:</span>
                            <span>JALMS High School</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex">
                            <span className="w-32 font-bold">Kelas</span>
                            <span className="px-2">:</span>
                            <span>{classData.name}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 font-bold">Semester</span>
                            <span className="px-2">:</span>
                            <span>{classData.term.type === 'ODD' ? '1 (Satu)' : '2 (Dua)'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-32 font-bold">Tahun Pelajaran</span>
                            <span className="px-2">:</span>
                            <span>{classData.term.academicYear?.name || 'Current'}</span>
                        </div>
                    </div>
                </div>

                {/* Grades Table */}
                <div className="mb-12 overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse border border-slate-300 dark:border-slate-700">
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-center align-middle">
                                <th className="border border-slate-300 dark:border-slate-700 p-2 w-12">No.</th>
                                <th className="border border-slate-300 dark:border-slate-700 p-2">MATA PELAJARAN</th>
                                <th className="border border-slate-300 dark:border-slate-700 p-2 lg:w-32">Nilai (Angka)</th>
                                <th className="border border-slate-300 dark:border-slate-700 p-2">Nilai (Huruf)</th>
                                <th className="border border-slate-300 dark:border-slate-700 p-2 w-48">Ketercapaian Member/Kompetensi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses!.map((course: any, i: number) => {
                                let ketercapaian = "";
                                if (course.grade > 85) ketercapaian = "Terlampaui";
                                else if (course.grade >= 75) ketercapaian = "Tercapai";
                                else ketercapaian = "Tidak Tercapai";

                                return (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">{i + 1}</td>
                                        <td className="border border-slate-300 dark:border-slate-700 p-2">{course.name}</td>
                                        <td className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold">{course.grade}</td>
                                        <td className="border border-slate-300 dark:border-slate-700 p-2 capitalize">{numberToIndonesianText(Math.round(course.grade))}</td>
                                        <td className="border border-slate-300 dark:border-slate-700 p-2 text-center text-xs italic">{ketercapaian}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>


            </div>
        </div>
    )
}
