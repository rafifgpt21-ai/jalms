
import { getUser } from "@/lib/actions/user.actions"
import { getStudentSchedule } from "@/lib/actions/schedule.actions"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { getPeriodLabel } from "@/lib/helpers/period-label"

export const dynamic = 'force-dynamic'

export default async function StudentSchedulePage() {
    const user = await getUser()

    if (!user) {
        redirect("/sign-in")
    }

    const result = await getStudentSchedule(user.id)

    if ('error' in result) {
        console.error(result.error)
        return <div className="p-6 text-red-500">Error loading schedule</div>
    }

    const { courses } = result

    // Days map
    const days = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ]

    // Initialize grid [day][period] -> Course | null
    // periods 0-7 (0=Morning, 1-6=Periods, 7=Night)
    const periods = Array.from({ length: 8 }, (_, i) => i)

    // Helper to find course at specific slot
    const getCourseAtSlot = (dayIdx: number, period: number) => {
        if (!courses) return null;
        for (const course of courses) {
            const schedule = course.schedules.find((s: any) => s.dayOfWeek === dayIdx && s.period === period)
            if (schedule) return course
        }
        return null
    }

    return (
        <div className="space-y-6 p-6">
            <MobileHeaderSetter title="My Weekly Schedule" />

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Header Row */}
                            <div className="grid grid-cols-8 gap-1 mb-1">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 font-bold text-center rounded-md">
                                    Period
                                </div>
                                {days.map((day) => (
                                    <div key={day} className="bg-blue-100 dark:bg-blue-900/30 p-2 font-bold text-center rounded-md">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Rows */}
                            {periods.map((period) => (
                                <div key={period} className="grid grid-cols-8 gap-1 mb-1">
                                    {/* Period Label */}
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 flex items-center justify-center font-medium rounded-md border border-gray-100 dark:border-gray-700">
                                        {getPeriodLabel(period)}
                                    </div>

                                    {/* Days */}
                                    {days.map((_, dayIdx) => {
                                        const course = getCourseAtSlot(dayIdx, period)
                                        return (
                                            <div
                                                key={`${dayIdx}-${period}`}
                                                className={`p-2 min-h-[80px] rounded-md border text-sm flex flex-col justify-center items-center text-center transition-colors ${course
                                                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800"
                                                    : "bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800"
                                                    }`}
                                            >
                                                {course ? (
                                                    <>
                                                        <div className="font-semibold text-blue-700 dark:text-blue-300 line-clamp-2">
                                                            {course.reportName || course.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {course.teacher.name}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
