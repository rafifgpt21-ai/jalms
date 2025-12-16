import { getDashboardStats } from "@/lib/actions/dashboard.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, School, BookOpen, Calendar, ArrowUpRight, Clock, Shield, Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"



export default async function AdminDashboard() {
    const { stats, lastLoggedInUsers, error } = await getDashboardStats()

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] rounded-3xl bg-red-50/50 border border-red-100 dark:bg-red-950/10 dark:border-red-900/20">
                <p className="text-red-500 font-medium">Error loading dashboard: {error}</p>
            </div>
        )
    }

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
                <div className="md:col-span-8 group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xl transition-all hover:shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="p-8 h-full flex flex-col justify-between relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-heading font-semibold text-slate-800 dark:text-slate-100">Today's Pulse</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </span>
                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-widest">Live Attendance</span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>

                        <div className="mt-8 flex items-end gap-4">
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">
                                        {stats?.attendance?.percentage ?? 0}%
                                    </span>
                                    <span className="text-sm font-medium text-slate-500 mb-2">Overall Present</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className="h-full bg-linear-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stats?.attendance?.percentage ?? 0}%` }}
                                    />
                                </div>
                                <p className="text-sm text-slate-400 mt-3 font-medium">
                                    Based on <span className="text-slate-700 dark:text-slate-200">{stats?.attendance?.totalRecords ?? 0}</span> sessions recorded today
                                </p>
                            </div>

                            {/* Circular indicator */}
                            <div className="hidden sm:flex h-24 w-24 rounded-full border-8 border-slate-100 dark:border-slate-800 items-center justify-center relative shrink-0">
                                <div
                                    className="absolute inset-0 rounded-full border-8 border-indigo-500 border-t-transparent border-l-transparent transform -rotate-45 opacity-20"
                                />
                                <div
                                    className="text-2xl font-bold text-slate-700 dark:text-slate-200"
                                >
                                    {stats?.attendance?.presentCount ?? 0}
                                </div>
                                <div className="absolute -bottom-6 text-[10px] font-semibold text-slate-400 uppercase">Present</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Total Users - Small Card (Span 4) */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-linear-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-500" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-medium text-indigo-100">Total Users</h3>
                                <Users className="h-5 w-5 text-indigo-200" />
                            </div>
                            <div>
                                <div className="text-5xl font-bold tracking-tight mb-1">
                                    {stats?.totalUsers || 0}
                                </div>
                                <p className="text-sm text-indigo-200/80 font-medium">Active Accounts</p>
                            </div>
                            <Button size="sm" variant="secondary" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} className="w-fit mt-4 bg-white/10 hover:bg-white/20 border-0 text-white" asChild>
                                <Link href="/admin/users" className="flex items-center gap-2">
                                    Manage <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

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
                <div className="md:col-span-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-slate-400" />
                            <h3 className="font-heading font-semibold text-slate-800 dark:text-slate-200">Recent Login Activity</h3>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-600" asChild>
                            <Link href="/admin/users">View All Users</Link>
                        </Button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {lastLoggedInUsers?.map((user) => (
                            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-900">
                                        <AvatarImage src={user.image || undefined} alt={user.name} />
                                        <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold">{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-end md:items-center gap-3 md:gap-6">

                                    <div className="text-xs font-medium text-slate-400 tabular-nums">
                                        {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, h:mm a") : "Never"}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!lastLoggedInUsers || lastLoggedInUsers.length === 0) && (
                            <div className="p-8 text-center text-slate-400">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div >
    )
}
