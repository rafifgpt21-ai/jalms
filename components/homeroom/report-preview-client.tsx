"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Loader2 } from "lucide-react"
import Link from "next/link"
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer"
import ReportCardDocument from "@/components/homeroom/report-card-pdf"

interface ReportPreviewClientProps {
    student: any
    classData: any
    courses: any[]
    extracurriculars: any[]
    achievements: any[]
    development: any[]
    attendance: any
    homeroomTeacherNote: string
    principalName: string
    classId: string
    studentId: string
}

export function ReportPreviewClient({
    student,
    classData,
    courses,
    extracurriculars,
    achievements,
    development,
    attendance,
    homeroomTeacherNote,
    principalName,
    classId,
    studentId
}: ReportPreviewClientProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-medium">Initialising PDF Document...</p>
            </div>
        )
    }

    const reportProps = {
        student,
        classData,
        courses,
        extracurriculars,
        achievements,
        development,
        attendance,
        note: homeroomTeacherNote,
        principalName,
        publishedDate: new Date()
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500">
            {/* Control Bar */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b shadow-md z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild className="rounded-xl">
                        <Link href={`/homeroom/${classId}/students/${studentId}/report`}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Edit
                        </Link>
                    </Button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                    <h1 className="font-semibold text-sm hidden sm:block">
                        Report Card Preview: <span className="text-primary">{student.name}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <PDFDownloadLink
                        document={<ReportCardDocument {...reportProps} />}
                        fileName={`Report_Card_${student.name.replace(/\s+/g, '_')}.pdf`}
                    >
                        {({ loading }: any) => (
                            <Button variant="outline" size="sm" disabled={loading} className="rounded-xl">
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                {loading ? "Preparing..." : "Download"}
                            </Button>
                        )}
                    </PDFDownloadLink>
                    
                    <Button size="sm" onClick={() => window.print()} className="hidden sm:flex rounded-xl">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden relative">
                <PDFViewer width="100%" height="100%" style={{ border: 'none' }} showToolbar={false}>
                    <ReportCardDocument {...reportProps} />
                </PDFViewer>
                
                {/* Fallback/Mobile Notice */}
                <div className="sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl shadow-2xl border text-center z-20 pointer-events-none">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Tips: Gunakan tombol <strong>Download</strong> di atas jika PDF tidak muncul di ponsel Anda.
                    </p>
                </div>
            </div>
        </div>
    )
}
