import { auth } from "@/auth"
import { getDailySchedule } from "@/lib/actions/attendance.actions"
import { DateNavigator } from "@/components/teacher/attendance/date-navigator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPeriodLabel } from "@/lib/helpers/period-label"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

import { SkipSessionButton } from "@/components/teacher/attendance/skip-session-button"
import { SkipAllButton } from "@/components/teacher/attendance/skip-all-button"

export default async function AttendancePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    if (!session?.user?.id) return <div>Not authenticated</div>

    const resolvedSearchParams = await searchParams
    const dateParam = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : undefined
    const date = dateParam ? new Date(dateParam) : new Date()

    const { schedules, error } = await getDailySchedule(session.user.id, date)

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="Attendance Manager" />
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground">Manage attendance for your classes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <SkipAllButton teacherId={session.user.id} date={date} />
                    <DateNavigator />
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-md bg-red-50 text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {!schedules || schedules.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-gray-50/5">
                    <p className="text-muted-foreground">No classes scheduled for {format(date, "EEEE, MMMM d, yyyy")}. :D</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {schedules.map((schedule) => (
                        <Card key={schedule.id} className={
                            schedule.isSkipped
                                ? "border-gray-200 bg-gray-50 opacity-75"
                                : schedule.isAttendanceTaken
                                    ? "border-green-200 bg-green-50/30"
                                    : ""
                        }>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2">
                                        {getPeriodLabel(schedule.period)}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        {schedule.isSkipped ? (
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Skipped
                                            </Badge>
                                        ) : schedule.isAttendanceTaken ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Taken
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Pending
                                            </Badge>
                                        )}
                                        <SkipSessionButton
                                            courseId={schedule.course.id}
                                            date={date}
                                            period={schedule.period}
                                            isSkipped={!!schedule.isSkipped}
                                        />
                                    </div>
                                </div>
                                <CardTitle className="text-lg">{schedule.course.name}</CardTitle>
                                {/* @ts-ignore - topic is added in the server action but type might not be inferred yet */}
                                {schedule.topic && (
                                    <p className="text-sm text-muted-foreground">
                                        {schedule.topic}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <Link href={`/teacher/courses/${schedule.course.id}/attendance/session?date=${format(date, "yyyy-MM-dd")}&period=${schedule.period}`}>
                                    <Button
                                        className="w-full"
                                        variant={schedule.isSkipped ? "secondary" : schedule.isAttendanceTaken ? "outline" : "default"}
                                    >
                                        {schedule.isSkipped ? "View Skipped Session" : schedule.isAttendanceTaken ? "Edit Attendance" : "Take Attendance"}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
