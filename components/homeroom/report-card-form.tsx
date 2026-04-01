"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Trash, FileCheck, Save, Loader2, RotateCcw, Eye, ExternalLink, Activity, UserCheck, XCircle } from "lucide-react"
import { upsertReportCard } from "@/lib/actions/homeroom.actions"
import { updatePrincipalName } from "@/lib/actions/system-config.actions"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

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
    const { classId, studentId } = useParams()

    // State
    const [extracurriculars, setExtracurriculars] = useState<any[]>(initialExtra)
    const [achievements, setAchievements] = useState<any[]>(initialAch)
    const [development, setDevelopment] = useState<any[]>(initialDev)
    const [attendance, setAttendance] = useState<any>(initialAtt)

    // Separate input state
    const [noteInput, setNoteInput] = useState(initialNote)
    const [principalNameInput, setPrincipalNameInput] = useState(initialPrincipal)

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
                router.refresh()
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    const handleSavePrincipalDefault = async () => {
        setIsPrincipalSaving(true)
        try {
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

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    }

    return (
        <motion.div
            className="max-w-4xl mx-auto space-y-8 pb-24"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Action Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border shadow-lg sticky top-4 z-30 transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl tracking-tight">Edit Report Data</h2>
                        <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${isSnapshot ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{isSnapshot ? "Published Snapshot" : "Draft Mode"}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" size="lg" asChild className="flex-1 md:flex-initial rounded-xl hover:bg-slate-50 active:scale-95 transition-all">
                        <Link href={`/homeroom/${classId}/students/${studentId}/report/preview`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview & Print
                        </Link>
                    </Button>
                    <Button variant="secondary" size="lg" onClick={() => handleSave(false)} disabled={isSaving} className="flex-1 md:flex-initial rounded-xl active:scale-95 transition-all">
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button size="lg" onClick={() => handleSave(true)} disabled={isSaving} className="flex-1 md:flex-initial rounded-xl shadow-md active:scale-95 transition-all">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                        Publish Report
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Attendance Highlights */}
                <motion.div variants={itemVariants}>
                    <Card className="border-none shadow-xl bg-linear-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <CardTitle className="text-lg">Ketidakhadiran</CardTitle>
                                <CardDescription>Data rekapitulasi kehadiran siswa semester ini</CardDescription>
                            </div>
                            {calculatedAttendance && !isSnapshot && (
                                <Button size="sm" variant="ghost" onClick={handleResetAttendance} className="text-primary hover:bg-primary/5 rounded-lg">
                                    <RotateCcw className="w-3 h-3 mr-2" />
                                    Sync Data
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="group relative p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 hover:shadow-md transition-all duration-300">
                                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border shadow-sm">
                                        <Activity className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <span className="text-sm font-semibold text-indigo-600/70 dark:text-indigo-400 block mb-1">Sakit</span>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-indigo-900 dark:text-indigo-100">{attendance.sick}</span>
                                        <span className="text-sm font-medium text-slate-500 mb-1.5 whitespace-nowrap">hari</span>
                                    </div>
                                </div>

                                <div className="group relative p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 hover:shadow-md transition-all duration-300">
                                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border shadow-sm">
                                        <UserCheck className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <span className="text-sm font-semibold text-amber-600/70 dark:text-amber-400 block mb-1">Izin</span>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-amber-900 dark:text-amber-100">{attendance.excused}</span>
                                        <span className="text-sm font-medium text-slate-500 mb-1.5 whitespace-nowrap">hari</span>
                                    </div>
                                </div>

                                <div className="group relative p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 hover:shadow-md transition-all duration-300">
                                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border shadow-sm">
                                        <XCircle className="w-5 h-5 text-rose-500" />
                                    </div>
                                    <span className="text-sm font-semibold text-rose-600/70 dark:text-rose-400 block mb-1">Alpha</span>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black text-rose-900 dark:text-rose-100">{attendance.alpha}</span>
                                        <span className="text-sm font-medium text-slate-500 mb-1.5 whitespace-nowrap">hari</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Form Sections Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Extracurriculars */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-2xl shadow-sm border-slate-200/60 transition-shadow hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">Ekstrakurikuler</CardTitle>
                                    <CardDescription>Kegiatan non-akademik di sekolah</CardDescription>
                                </div>
                                <Button size="sm" variant="outline" onClick={addExtra} className="rounded-lg h-9 w-9 p-0">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <AnimatePresence initial={false}>
                                    {extracurriculars.map((ex, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-4 items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 relative group"
                                        >
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Kegiatan</label>
                                                        <Input placeholder="e.g. Pramuka" value={ex.activity} onChange={(e) => updateExtra(i, "activity", e.target.value)} className="bg-white border-none shadow-sm focus-visible:ring-primary/20" />
                                                    </div>
                                                    <div className="w-full sm:w-32">
                                                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Predikat</label>
                                                        <Input placeholder="A / B / C" value={ex.predicate} onChange={(e) => updateExtra(i, "predicate", e.target.value)} className="bg-white border-none shadow-sm focus-visible:ring-primary/20 text-center font-bold" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Keterangan Capaian</label>
                                                    <Input placeholder="Tulis catatan perkembangan siswa..." value={ex.note} onChange={(e) => updateExtra(i, "note", e.target.value)} className="bg-white border-none shadow-sm focus-visible:ring-primary/20" />
                                                </div>
                                            </div>
                                            <Button size="icon" variant="ghost" className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg shrink-0 mt-6" onClick={() => removeExtra(i)}>
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {extracurriculars.length === 0 && (
                                    <div className="py-8 text-center border-2 border-dashed rounded-2xl border-slate-100 dark:border-slate-800">
                                        <p className="text-sm text-slate-400">Belum ada data ekstrakurikuler</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Prestasi & Pengembangan Diri Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Achievements */}
                        <motion.div variants={itemVariants}>
                            <Card className="rounded-2xl shadow-sm h-full flex flex-col border-slate-200/60">
                                <CardHeader className="flex flex-row items-center justify-between shrink-0">
                                    <div>
                                        <CardTitle className="text-base">Prestasi</CardTitle>
                                        <CardDescription>Pencapaian siswa</CardDescription>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={addAch} className="rounded-lg"><Plus className="w-4 h-4" /></Button>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1">
                                    {achievements.map((ach, i) => (
                                        <div key={i} className="flex gap-2 items-start border-b border-slate-50 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                                            <div className="flex-1 space-y-2">
                                                <Input placeholder="Jenis Prestasi" value={ach.name} onChange={(e) => updateAch(i, "name", e.target.value)} className="px-0 font-medium border-none bg-transparent shadow-none focus-visible:ring-0" />
                                                <Input placeholder="Keterangan..." value={ach.note} onChange={(e) => updateAch(i, "note", e.target.value)} className="px-0 text-slate-500 text-sm h-7 border-none bg-transparent shadow-none focus-visible:ring-0" />
                                            </div>
                                            <Button size="icon" variant="ghost" className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0" onClick={() => removeAch(i)}><Trash className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Development */}
                        <motion.div variants={itemVariants}>
                            <Card className="rounded-2xl shadow-sm h-full flex flex-col border-slate-200/60">
                                <CardHeader className="flex flex-row items-center justify-between shrink-0">
                                    <div>
                                        <CardTitle className="text-base">Pengembangan Diri</CardTitle>
                                        <CardDescription>Kegiatan eksplorasi diri</CardDescription>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={addDev} className="rounded-lg"><Plus className="w-4 h-4" /></Button>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1">
                                    {development.map((dev, i) => (
                                        <div key={i} className="flex gap-2 items-start border-b border-slate-50 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                                            <div className="flex-1 space-y-2">
                                                <Input placeholder="Kegiatan" value={dev.activity} onChange={(e) => updateDev(i, "activity", e.target.value)} className="px-0 font-medium border-none bg-transparent shadow-none focus-visible:ring-0" />
                                                <Input placeholder="Keterangan..." value={dev.note} onChange={(e) => updateDev(i, "note", e.target.value)} className="px-0 text-slate-500 text-sm h-7 border-none bg-transparent shadow-none focus-visible:ring-0" />
                                            </div>
                                            <Button size="icon" variant="ghost" className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0" onClick={() => removeDev(i)}><Trash className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Teacher Note */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-2xl shadow-sm border-slate-200/60 overflow-hidden group">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">Catatan Wali Kelas</CardTitle>
                                <CardDescription>Catatan khusus untuk perkembangan siswa keseluruhan</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Textarea
                                    placeholder="Tulis saran, motivasi, atau catatan untuk orang tua siswa..."
                                    className="min-h-[160px] bg-slate-50/50 dark:bg-slate-800/30 border-none resize-none focus-visible:ring-primary/20 rounded-xl transition-all duration-300 group-focus-within:bg-white dark:group-focus-within:bg-slate-800"
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Administration / Signature */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-2xl shadow-sm border-slate-200/60">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">Lain-lain</CardTitle>
                                <CardDescription>Data administratif penunjang rapor</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-2">
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Nama Kepala Sekolah (Penandatangan)</label>
                                    <div className="flex gap-3">
                                        <Input
                                            placeholder="Masukkan nama kepala sekolah..."
                                            value={principalNameInput}
                                            onChange={(e) => setPrincipalNameInput(e.target.value)}
                                            className="bg-white border-none shadow-sm rounded-xl focus-visible:ring-primary/20 h-11"
                                        />
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            onClick={handleSavePrincipalDefault}
                                            disabled={isPrincipalSaving}
                                            className="h-11 rounded-xl px-4 shrink-0 transition-transform active:scale-95"
                                            title="Simpan sebagai default sistem"
                                        >
                                            {isPrincipalSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            <span className="hidden sm:inline ml-2">Set Default</span>
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1.5">
                                        <Activity className="w-3 h-3" />
                                        Gunakan tombol simpan di samping untuk menerapkan nama ini secara otomatis ke semua rapor lainnya.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
