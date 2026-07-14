"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { executeAcademicRollover, previewAcademicRollover, type RolloverOptions } from "@/lib/actions/rollover.actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WorkspacePanel } from "@/components/workspace/workspace-page"
import { StatusBadge } from "@/components/ui/status-badge"

const defaults: RolloverOptions = { classes: true, classRosters: true, courses: true, courseMemberships: true, assignmentsAsDrafts: true, announcementsAsDrafts: true, schedules: true, materials: true }

export function RolloverWorkspace({ terms, recent }: { terms: any[]; recent: any[] }) {
  const [source, setSource] = useState("")
  const [target, setTarget] = useState("")
  const [options, setOptions] = useState(defaults)
  const [preview, setPreview] = useState<any>(null)
  const [pending, startTransition] = useTransition()
  const labels: Record<keyof RolloverOptions, string> = { classes: "Classes and colors", classRosters: "Class rosters", courses: "Courses and settings", courseMemberships: "Course memberships", assignmentsAsDrafts: "Tasks as drafts", announcementsAsDrafts: "Announcements as drafts", schedules: "Schedules", materials: "Material assignments" }

  const runPreview = () => startTransition(async () => {
    const result = await previewAcademicRollover(source, target)
    if (result.error) { toast.error(result.error); return }
    setPreview(result.preview)
  })
  const execute = () => startTransition(async () => {
    const result = await executeAcademicRollover(source, target, options)
    if ("error" in result) { toast.error(result.error); return }
    toast.success(result.status === "COMPLETED" ? "Semester rollover completed" : "Rollover completed with warnings")
    setPreview(null)
  })

  return <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
    <WorkspacePanel className="space-y-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><div className="mb-1 text-sm font-medium">Copy from</div><Select value={source} onValueChange={(value) => { setSource(value); setPreview(null) }}><SelectTrigger><SelectValue placeholder="Source semester" /></SelectTrigger><SelectContent>{terms.map(term => <SelectItem key={term.id} value={term.id}>{term.academicYear.name} · {term.type.toLowerCase()}</SelectItem>)}</SelectContent></Select></div>
        <div><div className="mb-1 text-sm font-medium">Copy into</div><Select value={target} onValueChange={(value) => { setTarget(value); setPreview(null) }}><SelectTrigger><SelectValue placeholder="Target semester" /></SelectTrigger><SelectContent>{terms.map(term => <SelectItem key={term.id} value={term.id}>{term.academicYear.name} · {term.type.toLowerCase()}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div><div className="mb-2 text-sm font-medium">Teaching setup to carry forward</div><div className="grid gap-2 sm:grid-cols-2">{Object.entries(labels).map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-md border p-2 text-sm"><Checkbox checked={options[key as keyof RolloverOptions]} onCheckedChange={(checked) => setOptions(current => ({ ...current, [key]: checked === true }))} />{label}</label>)}</div><p className="mt-2 text-xs text-muted-foreground">Grades, submissions, attendance records, and report cards are never copied. Tasks and announcements are drafts.</p></div>
      {!preview ? <Button disabled={pending || !source || !target} onClick={runPreview}>{pending ? "Checking..." : "Preview impact"}</Button> : <div className="space-y-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3"><div className="font-medium">{preview.source} → {preview.target}</div><div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"><div><b>{preview.classes}</b><br />classes</div><div><b>{preview.students}</b><br />roster entries</div><div><b>{preview.courses}</b><br />courses</div><div><b>{preview.assignments}</b><br />tasks</div></div>{preview.conflicts.length > 0 && <div className="text-sm text-amber-700 dark:text-amber-300">Existing target items will be reused: {preview.conflicts.join(", ")}</div>}<Button disabled={pending} onClick={execute}>{pending ? "Running..." : "Confirm rollover"}</Button></div>}
    </WorkspacePanel>
    <WorkspacePanel className="overflow-hidden"><div className="border-b px-4 py-3 font-medium">Recent runs</div><div className="divide-y">{recent.map(run => <div key={run.id} className="px-4 py-3 text-sm"><div className="flex items-center justify-between"><StatusBadge status={run.status} /><span className="text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleDateString()}</span></div><div className="mt-1 text-xs text-muted-foreground">{(run.summary as any)?.coursesCreated || 0} courses · {(run.summary as any)?.classesCreated || 0} classes</div></div>)}{!recent.length && <div className="p-8 text-center text-sm text-muted-foreground">No rollover runs yet.</div>}</div></WorkspacePanel>
  </div>
}
