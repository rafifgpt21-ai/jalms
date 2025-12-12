"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getCourseGradebook } from "@/lib/actions/teacher.actions"
import { GradebookView } from "@/components/teacher/gradebook/gradebook-view"

export default function GradebookPage() {
    const params = useParams()
    const courseId = params.courseId as string

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (courseId) {
            loadGradebook()
        }
    }, [courseId])

    async function loadGradebook() {
        setLoading(true)
        setError(null)
        try {
            const res = await getCourseGradebook(courseId)
            if (res.gradebook) {
                setData(res)
            } else {
                setError(res.error || "Failed to load gradebook")
                toast.error(res.error || "Failed to load gradebook")
            }
        } catch (err) {
            setError("An unexpected error occurred")
            console.error(err)
        }
        setLoading(false)
    }

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
    }

    if (error) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-lg">Error: {error}</div>
    }

    if (!data) {
        return <div className="p-8 text-slate-500">Gradebook not found</div>
    }

    return (
        <div className="space-y-6">
            <GradebookView data={data} />
        </div>
    )
}
