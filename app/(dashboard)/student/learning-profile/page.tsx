/* eslint-disable react/no-unescaped-entities */
import { Suspense } from "react"
import { getStudentLearningProfile } from "@/lib/actions/intelligence.actions"
import { getUser } from "@/lib/actions/user.actions"
import { redirect } from "next/navigation"
import { LearningProfileTable } from "@/components/student/intelligence/profile-table"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import dynamicLoader from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const LearningRadarChart = dynamicLoader(
    () => import("@/components/student/intelligence/radar-chart"),
    { loading: () => <Skeleton className="h-[450px] w-full rounded-xl" /> }
)

export const dynamic = "force-dynamic"

async function LearningProfileContent() {
    const user = await getUser()

    if (!user || !user.id) {
        redirect("/auth/signin")
    }

    if (!user.roles.includes("STUDENT")) {
        return <div className="p-8">This page is only available for students.</div>
    }

    const { profile } = await getStudentLearningProfile(user.id)

    return <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LearningRadarChart data={profile || []} />
                {/* We can add another chart or summary here if needed, or just let the table take full width below */}
                <div className="hidden lg:block">
                    {/* Placeholder for future insights or recommendations */}
                    <div className="h-full flex items-center justify-center p-6 border rounded-lg bg-muted/10 text-muted-foreground text-center">
                        <p>
                            "Everybody is a genius. But if you judge a fish by its ability to climb a tree, it will live its whole life believing that it is stupid."
                            <br />
                            <span className="text-sm font-semibold mt-2 block">- Albert Einstein</span>
                        </p>
                    </div>
                </div>
            </div>

            <LearningProfileTable data={profile || []} />
    </>
}

function LearningProfileSkeleton() {
    return <div className="space-y-6" aria-label="Loading learning profile" aria-busy="true">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Skeleton className="h-[450px] w-full rounded-xl" /><Skeleton className="hidden h-[450px] w-full rounded-xl lg:block" /></div>
        <Skeleton className="h-[32rem] w-full rounded-xl" />
    </div>
}

export default function LearningProfilePage() {
    return <div className="space-y-6">
        <MobileHeaderSetter title="Learning Profile" />
        <Suspense fallback={<LearningProfileSkeleton />}><LearningProfileContent /></Suspense>
    </div>
}
