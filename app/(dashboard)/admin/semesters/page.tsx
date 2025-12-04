import { Suspense } from "react"
import { getSemesters } from "@/lib/actions/academic-year.actions"
import { SemesterList } from "@/components/admin/academic/semester-list"
import { SemesterModal } from "@/components/admin/academic/semester-modal"

export const dynamic = "force-dynamic"

export default async function SemestersPage() {
    console.log("SemestersPage: Rendering...")
    const { terms, error } = await getSemesters()
    console.log("SemestersPage: Received terms:", terms?.length)

    if (error) {
        console.error("SemestersPage: Error:", error)
        return <div>Error loading semesters</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Semesters</h1>
                    <p className="text-muted-foreground">
                        Manage academic terms and set the active semester.
                    </p>
                </div>
                <SemesterModal />
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <SemesterList terms={terms || []} />
            </Suspense>
        </div>
    )
}
