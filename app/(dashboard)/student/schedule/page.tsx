
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

            {/* Main Glass Card */}
            <Card style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }} className="overflow-hidden border-none shadow-xl bg-white/60 dark:bg-slate-900/40 ring-1 ring-black/5 dark:ring-white/10">
                <CardHeader className="border-b border-black/5 dark:border-white/5 pb-4">
                    <CardTitle className="font-heading text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                        Weekly Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <div className="overflow-x-auto pb-4">
                        <div className="min-w-[800px]">
                            {/* Header Row */}
                            <div className="grid grid-cols-8 gap-2 mb-2">
                                <div style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} className="p-3 font-heading font-bold text-center rounded-xl text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50">
                                    Period
                                </div>
                                {days.map((day) => (
                                    <div key={day} style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} className="p-3 font-heading font-bold text-center rounded-xl text-white bg-indigo-600/90 shadow-lg shadow-indigo-600/20">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Rows */}
                            {periods.map((period) => (
                                <div key={period} className="grid grid-cols-8 gap-2 mb-2">
                                    {/* Period Label */}
                                    <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 rounded-xl border border-white/50 dark:border-white/5 shadow-sm">
                                        {getPeriodLabel(period)}
                                    </div>

                                    {/* Days */}
                                    {days.map((_, dayIdx) => {
                                        const course = getCourseAtSlot(dayIdx, period)
                                        return (
                                            <div
                                                key={`${dayIdx}-${period}`}
                                                className={`group relative p-2 min-h-[100px] rounded-2xl flex flex-col justify-center items-center text-center transition-all duration-300 ${course
                                                    ? "bg-white/80 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-500/20 shadow-md shadow-indigo-500/5 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
                                                    : "bg-slate-50/30 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800"
                                                    }`}
                                            >
                                                {course ? (
                                                    <>
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <div className="font-heading font-bold text-indigo-900 dark:text-indigo-100 line-clamp-2 px-1 text-sm sm:text-base">
                                                            {course.reportName || course.name}
                                                        </div>
                                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                            {course.teacher.name}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-700 select-none text-xl font-light">·</span>
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
