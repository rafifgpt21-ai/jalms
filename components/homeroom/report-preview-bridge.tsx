"use client"

import dynamic from "next/dynamic"

// This is a bridge component that is a Client Component itself,
// allowing us to use dynamic with ssr: false in a way that
// satisfies Next.js 16's strict Server Component rules.
const ReportPreviewClient = dynamic(
    () => import("@/components/homeroom/report-preview-client").then(mod => mod.ReportPreviewClient),
    { 
        ssr: false,
        loading: () => (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading Preview Workspace...</p>
            </div>
        )
    }
)

export function ReportPreviewBridge(props: any) {
    return <ReportPreviewClient {...props} />
}
