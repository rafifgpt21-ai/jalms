import { auth } from "@/auth"
import { getDailySchedule } from "@/lib/actions/attendance.actions"
import { DateNavigator } from "@/components/teacher/attendance/date-navigator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { getPeriodLabel } from "@/lib/helpers/period-label"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

import { SkipSessionButton } from "@/components/teacher/attendance/skip-session-button"
import { SkipAllButton } from "@/components/teacher/attendance/skip-all-button"
import { WorkspaceActions } from "@/components/workspace/workspace-page"

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
            <MobileHeaderSetter title="Attendance Manager" subtitle="Manage attendance for your classes." />
            <WorkspaceActions>
                    <SkipAllButton teacherId={session.user.id} date={date} />
                    <DateNavigator />
            </WorkspaceActions>

            {error && (
                <div className="p-4 rounded-md bg-red-50 text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {!schedules || schedules.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 py-12 text-center">
                    <p className="text-muted-foreground">No classes scheduled for {format(date, "EEEE, MMMM d, yyyy")}. :D</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {schedules.map((schedule) => (
                        <Card key={schedule.id} className={
                            schedule.isSkipped
                                ? "border-gray-200 bg-gray-50 opacity-75 dark:border-slate-700 dark:bg-slate-900/60"
                                : schedule.isAttendanceTaken
                                    ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/70 dark:bg-emerald-950/20"
                                    : ""
                        }>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2">
                                        {getPeriodLabel(schedule.period)}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        {schedule.isSkipped ? (
                                            <StatusBadge status="SKIPPED" label="Skipped">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Skipped
                                            </StatusBadge>
                                        ) : schedule.isAttendanceTaken ? (
                                            <StatusBadge status="TAKEN" label="Taken">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Taken
                                            </StatusBadge>
                                        ) : (
                                            <StatusBadge status="PENDING" label="Pending">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Pending
                                            </StatusBadge>
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
