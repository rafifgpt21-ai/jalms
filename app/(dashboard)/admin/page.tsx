import { Suspense } from "react"
import Link from "next/link"
import { School, BookOpen, Calendar, Users, Shield, Activity } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspacePage } from "@/components/workspace/workspace-page"

import {
    AttendancePulseCard,
    TotalUsersCard,
    RecentLoginList
} from "@/components/admin/dashboard/admin-dashboard-components"
import {
    PulseSkeleton,
    TotalUsersSkeleton,
    RecentLoginSkeleton
} from "@/components/admin/dashboard/admin-skeletons"

export const dynamic = "force-dynamic"

export default function AdminDashboard() {

    const quickActions = [
        { href: "/admin/schedule", icon: Calendar, label: "Schedule Manager", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100/50 dark:bg-blue-950/30" },
        { href: "/admin/classes", icon: School, label: "Manage Classes", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100/50 dark:bg-violet-950/30" },
        { href: "/admin/courses", icon: BookOpen, label: "Manage Courses", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100/50 dark:bg-emerald-950/30" },
        { href: "/admin/users", icon: Users, label: "Manage Users", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100/50 dark:bg-orange-950/30" },
        { href: "/admin/semesters", icon: Calendar, label: "Semesters", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-100/50 dark:bg-pink-950/30" },
        { href: "/admin/socials", icon: Activity, label: "Socials Check", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100/50 dark:bg-cyan-950/30" },
    ]

    return (
        <WorkspacePage className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MobileHeaderSetter title="Dashboard" subtitle={format(new Date(), "EEEE, MMMM do yyyy")} />
            <div className="flex justify-end">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <Shield className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Admin Access</span>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">

                {/* 1. Today's Pulse - Large Card (Span 8) */}
                <Suspense fallback={<PulseSkeleton />}>
                    <AttendancePulseCard />
                </Suspense>

                {/* 2. Total Users - Small Card (Span 4) */}
                <Suspense fallback={<TotalUsersSkeleton />}>
                    <TotalUsersCard />
                </Suspense>

                {/* 3. Quick Actions - Horizontal Strip (Span 12) */}
                <div className="xl:col-span-12">
                    <h3 className="text-lg font-heading font-semibold text-slate-700 dark:text-slate-300 mb-4 px-1">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                        {quickActions.map((action) => (
                            <Link key={action.label} href={action.href}>
                                <div
                                    className="group flex h-full min-h-28 flex-col items-center justify-center gap-2 rounded-xl border bg-card p-3 text-center shadow-xs transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-800 sm:gap-3 sm:p-4"
                                >
                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", action.bg, action.color)}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {action.label}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 4. Recent Activity (Last Logged In) - Span 12 */}
                <Suspense fallback={<RecentLoginSkeleton />}>
                    <RecentLoginList />
                </Suspense>

            </div>
        </WorkspacePage>
    )
}
