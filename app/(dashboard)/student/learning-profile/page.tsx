import { getStudentIntelligenceProfile } from "@/lib/actions/intelligence.actions"
import { getUser } from "@/lib/actions/user.actions"
import { redirect } from "next/navigation"
import { IntelligenceRadarChart } from "@/components/student/intelligence/radar-chart"
import { IntelligenceProfileTable } from "@/components/student/intelligence/profile-table"

export const dynamic = "force-dynamic"

export default async function LearningProfilePage() {
    const user = await getUser()

    if (!user || !user.id) {
        redirect("/auth/signin")
    }

    if (!user.roles.includes("STUDENT")) {
        return <div className="p-8">This page is only available for students.</div>
    }

    const { profile } = await getStudentIntelligenceProfile(user.id)

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IntelligenceRadarChart data={profile || []} />
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

            <IntelligenceProfileTable data={profile || []} />
        </div>
    )
}
