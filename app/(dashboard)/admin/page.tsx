import { Suspense } from "react"
import Link from "next/link"
import { School, BookOpen, Calendar, Users, Shield, Activity } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                        Admin Overview
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        {format(new Date(), "EEEE, MMMM do yyyy")}
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Shield className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Admin Access</span>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 1. Today's Pulse - Large Card (Span 8) */}
                <Suspense fallback={<PulseSkeleton />}>
                    <AttendancePulseCard />
                </Suspense>

                {/* 2. Total Users - Small Card (Span 4) */}
                <Suspense fallback={<TotalUsersSkeleton />}>
                    <TotalUsersCard />
                </Suspense>

                {/* 3. Quick Actions - Horizontal Strip (Span 12) */}
                <div className="md:col-span-12">
                    <h3 className="text-lg font-heading font-semibold text-slate-700 dark:text-slate-300 mb-4 px-1">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {quickActions.map((action) => (
                            <Link key={action.label} href={action.href}>
                                <div
                                    className="h-full flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 transition-all hover:bg-white/60 dark:hover:bg-slate-900/60 hover:border-indigo-200/50 dark:hover:border-indigo-800/50 hover:shadow-lg hover:-translate-y-1 group text-center cursor-pointer shadow-sm"
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
        </div >
    )
}
