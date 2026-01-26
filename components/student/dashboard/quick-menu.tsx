"use client"

import Link from "next/link"
import {
    BookOpen,
    Calendar,
    GraduationCap,
    User,
    ClipboardCheck,
    Library
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const quickLinks = [
    {
        label: "Courses",
        href: "/student/courses",
        icon: BookOpen,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
        label: "Schedule",
        href: "/student/schedule",
        icon: Calendar,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-100 dark:bg-purple-900/30"
    },
    {
        label: "Grades",
        href: "/student/grades",
        icon: GraduationCap,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-900/30"
    },
    {
        label: "Attendance",
        href: "/student/attendance",
        icon: ClipboardCheck,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-900/30"
    },
    {
        label: "Profile",
        href: "/student/learning-profile",
        icon: User,
        color: "text-pink-600 dark:text-pink-400",
        bg: "bg-pink-100 dark:bg-pink-900/30"
    },
]

export function QuickMenu() {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {quickLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="group"
                >
                    <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white/60 dark:bg-slate-900/40 rounded-2xl border border-white/20 dark:border-white/5 shadow-sm hover:shadow-md transition-all hover:bg-white/80 dark:hover:bg-slate-800/80 active:scale-95 duration-200 h-full">
                        <div className={`p-2.5 sm:p-3 rounded-xl mb-2 sm:mb-3 ${link.bg} transition-transform group-hover:scale-110 duration-200`}>
                            <link.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${link.color}`} />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-center line-clamp-1">
                            {link.label}
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    )
}

export function QuickMenuSkeleton() {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white/40 dark:bg-slate-900/20 rounded-2xl border border-white/20 dark:border-white/5">
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-2 sm:mb-3" />
                    <Skeleton className="w-16 h-3 sm:h-4 rounded-full" />
                </div>
            ))}
        </div>
    )
}
