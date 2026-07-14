"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { getCourseGradebook } from "@/lib/actions/teacher.actions"
import { GradebookView, type GradebookData } from "@/components/teacher/gradebook/gradebook-view"

export default function GradebookPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<GradebookData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return
    let active = true

    async function loadGradebook() {
      setLoading(true)
      setError(null)
      try {
        const response = await getCourseGradebook(courseId)
        if (!active) return
        if ("gradebook" in response && response.gradebook) {
          setData(response as GradebookData)
        } else {
          const message = response.error || "Failed to load gradebook"
          setError(message)
          toast.error(message)
        }
      } catch (caughtError) {
        if (!active) return
        console.error(caughtError)
        setError("An unexpected error occurred")
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadGradebook()
    return () => { active = false }
  }, [courseId])

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border bg-card">
        <Loader2 className="size-7 animate-spin text-indigo-500" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">Loading gradebook…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="mt-3 font-semibold text-destructive">Gradebook unavailable</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{error || "Gradebook not found"}</p>
      </div>
    )
  }

  return <GradebookView data={data} />
}
