"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import ReportCardDocument from "./report-card-pdf"
import { Plus, Trash, FileCheck, Save, Loader2, RotateCcw } from "lucide-react"
import { upsertReportCard } from "@/lib/actions/homeroom.actions"
import { updatePrincipalName } from "@/lib/actions/system-config.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ReportCardFormProps {
    student: any
    classData: any
    courses: any[]
    extracurriculars: any[]
    achievements: any[]
    development: any[]
    attendance: any
    homeroomTeacherNote: string
    principalName: string
    isSnapshot: boolean
    gradingScale: any[]
    calculatedAttendance?: any // { sick: number, excused: number, alpha: number }
}

const ReportPreview = ({
    student,
    classData,
    courses,
    extracurriculars,
    achievements,
    development,
    attendance,
    note,
    principalName,
    publishedDate
}: any) => {
    return (
        <div className="border rounded-lg overflow-hidden h-[800px] bg-slate-100 dark:bg-slate-800">
            <PDFViewer width="100%" height="100%" showToolbar={true}>
                <ReportCardDocument
                    student={student}
                    classData={classData}
                    courses={courses}
                    extracurriculars={extracurriculars}
                    achievements={achievements}
                    development={development}
                    attendance={attendance}
                    note={note}
                    principalName={principalName}
                    publishedDate={publishedDate}
                />
            </PDFViewer>
        </div>
    )
}

// Memoize the preview so it doesn't re-render on every keystroke of the form
const MemoizedReportPreview = React.memo(ReportPreview)

export function ReportCardForm({
    student,
    classData,
    courses,
    extracurriculars: initialExtra,
    achievements: initialAch,
    development: initialDev,
    attendance: initialAtt,
    homeroomTeacherNote: initialNote,
    principalName: initialPrincipal,
    isSnapshot,
    gradingScale,
    calculatedAttendance
}: ReportCardFormProps) {
    const router = useRouter()


    // State
    const [extracurriculars, setExtracurriculars] = useState<any[]>(initialExtra)
    const [achievements, setAchievements] = useState<any[]>(initialAch)
    const [development, setDevelopment] = useState<any[]>(initialDev)
    const [attendance, setAttendance] = useState<any>(initialAtt)

    // Separate input state from saved state for performance
    const [noteInput, setNoteInput] = useState(initialNote)
    const [savedNote, setSavedNote] = useState(initialNote)

    const [principalNameInput, setPrincipalNameInput] = useState(initialPrincipal)
    const [savedPrincipalName, setSavedPrincipalName] = useState(initialPrincipal)

    const [isSaving, setIsSaving] = useState(false)
    const [isPrincipalSaving, setIsPrincipalSaving] = useState(false)

    // Handlers
    const addExtra = () => setExtracurriculars([...extracurriculars, { activity: "", predicate: "", note: "" }])
    const removeExtra = (i: number) => setExtracurriculars(extracurriculars.filter((_, idx) => idx !== i))
    const updateExtra = (i: number, field: string, val: string) => {
        const newArr = [...extracurriculars]
        newArr[i] = { ...newArr[i], [field]: val }
        setExtracurriculars(newArr)
    }

    // Handlers for Development
    const addDev = () => setDevelopment([...development, { activity: "", note: "" }])
    const removeDev = (i: number) => setDevelopment(development.filter((_, idx) => idx !== i))
    const updateDev = (i: number, field: string, val: string) => {
        const newArr = [...development]
        newArr[i] = { ...newArr[i], [field]: val }
        setDevelopment(newArr)
    }

    const addAch = () => setAchievements([...achievements, { name: "", note: "" }])
    const removeAch = (i: number) => setAchievements(achievements.filter((_, idx) => idx !== i))
    const updateAch = (i: number, field: string, val: string) => {
        const newArr = [...achievements]
        newArr[i] = { ...newArr[i], [field]: val }
        setAchievements(newArr)
    }

    const handleResetAttendance = () => {
        if (calculatedAttendance) {
            setAttendance(calculatedAttendance)
            toast.info("Attendance reset to calculated values")
        }
    }

    const handleSave = async (published: boolean) => {
        setIsSaving(true)
        try {
            // Ensure we save the latest input
            const res = await upsertReportCard(classData.id, student.id, {
                extracurriculars,
                achievements,
                development,
                attendance: {
                    sick: Number(attendance.sick) || 0,
                    excused: Number(attendance.excused) || 0,
                    alpha: Number(attendance.alpha) || 0
                },
                homeroomTeacherNote: noteInput,
                principalName: principalNameInput,
                published
            })

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(published ? "Report Card Published!" : "Draft Saved")
                // Update saved state as we just saved to DB
                setSavedNote(noteInput)
                setSavedPrincipalName(principalNameInput)
                router.refresh()
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    // Handler specifically for updating the note preview
    const handleSaveNotePreview = () => {
        setSavedNote(noteInput)
        toast.success("Catatan diperbarui di preview")
    }

    const handleSavePrincipalDefault = async () => {
        setIsPrincipalSaving(true)
        try {
            // Update preview immediately
            setSavedPrincipalName(principalNameInput)

            const res = await updatePrincipalName(principalNameInput)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Nama Kepala Sekolah disimpan sebagai default")
            }
        } catch (err) {
            toast.error("Gagal menyimpan data sistem")
        } finally {
            setIsPrincipalSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm sticky top-4 z-10">
                <div>
                    <h2 className="font-bold text-lg">Edit Report Data</h2>
                    <p className="text-sm text-slate-500">{isSnapshot ? "Viewing Published Snapshot" : "Draft Mode"}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4 mr-2" />}
                        Publish Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="space-y-6">
                    {/* Attendance */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base">Ketidakhadiran</CardTitle>
                            {calculatedAttendance && !isSnapshot && (
                                <Button size="sm" variant="outline" onClick={handleResetAttendance} title="Refresh data from system">
                                    <RotateCcw className="w-3 h-3 mr-2" />
                                    Refresh
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
                                <span className="text-xs font-medium text-slate-500 block mb-1">Sakit</span>
                                <span className="text-xl font-bold">{attendance.sick}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
                                <span className="text-xs font-medium text-slate-500 block mb-1">Izin</span>
                                <span className="text-xl font-bold">{attendance.excused}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-center">
                                <span className="text-xs font-medium text-slate-500 block mb-1">Tanpa Keterangan</span>
                                <span className="text-xl font-bold">{attendance.alpha}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Extracurriculars */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Ekstrakurikuler</CardTitle>
                            <Button size="sm" variant="ghost" onClick={addExtra}><Plus className="w-4 h-4" /></Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {extracurriculars.map((ex, i) => (
                                <div key={i} className="flex gap-2 items-start border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <Input placeholder="Kegiatan (e.g. Pramuka)" value={ex.activity} onChange={(e) => updateExtra(i, "activity", e.target.value)} />
                                            <Input className="w-24" placeholder="Predikat" value={ex.predicate} onChange={(e) => updateExtra(i, "predicate", e.target.value)} />
                                        </div>
                                        <Input placeholder="Keterangan" value={ex.note} onChange={(e) => updateExtra(i, "note", e.target.value)} />
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeExtra(i)}><Trash className="w-4 h-4" /></Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Prestasi</CardTitle>
                            <Button size="sm" variant="ghost" onClick={addAch}><Plus className="w-4 h-4" /></Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {achievements.map((ach, i) => (
                                <div key={i} className="flex gap-2 items-start border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex-1 space-y-2">
                                        <Input placeholder="Jenis Prestasi" value={ach.name} onChange={(e) => updateAch(i, "name", e.target.value)} />
                                        <Input placeholder="Keterangan" value={ach.note} onChange={(e) => updateAch(i, "note", e.target.value)} />
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeAch(i)}><Trash className="w-4 h-4" /></Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Development */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Pengembangan Diri</CardTitle>
                            <Button size="sm" variant="ghost" onClick={addDev}><Plus className="w-4 h-4" /></Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {development.map((dev, i) => (
                                <div key={i} className="flex gap-2 items-start border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex-1 space-y-2">
                                        <Input placeholder="Kegiatan" value={dev.activity} onChange={(e) => updateDev(i, "activity", e.target.value)} />
                                        <Input placeholder="Keterangan" value={dev.note} onChange={(e) => updateDev(i, "note", e.target.value)} />
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeDev(i)}><Trash className="w-4 h-4" /></Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>


                    {/* Teacher Note & Principal */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Catatan Wali Kelas</CardTitle>
                            <Button variant="outline" size="sm" onClick={handleSaveNotePreview} title="Update PDF Preview">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Textarea
                                    placeholder="Tulis catatan untuk siswa..."
                                    className="min-h-[100px]"
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Principal Name Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Data Tanda Tangan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-medium mb-1 block">Nama Kepala Sekolah</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nama Kepala Sekolah..."
                                        value={principalNameInput}
                                        onChange={(e) => setPrincipalNameInput(e.target.value)}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={handleSavePrincipalDefault}
                                        disabled={isPrincipalSaving}
                                        title="Simpan sebagai default untuk semua rapot"
                                    >
                                        {isPrincipalSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Klik tombol save di samping untuk menetapkan nama ini sebagai default untuk semua rapot.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Section */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">PDF Preview</h3>
                    <MemoizedReportPreview
                        student={student}
                        classData={classData}
                        courses={courses}
                        extracurriculars={extracurriculars}
                        achievements={achievements}
                        development={development}
                        attendance={attendance}
                        note={savedNote}
                        principalName={savedPrincipalName}
                        publishedDate={new Date()}
                    />
                </div>
            </div>
        </div>
    )
}
