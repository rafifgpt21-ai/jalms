"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import { UserSettings } from "@/components/user-settings"

interface WorkspaceTabsProps {
    roles: Role[]
    userName?: string | null
    userEmail?: string | null
}

export function WorkspaceTabs({ roles, userName, userEmail }: WorkspaceTabsProps) {
    const pathname = usePathname()

    const tabs = [
        {
            label: "Admin",
            href: "/admin",
            role: Role.ADMIN,
            isActive: pathname.startsWith("/admin"),
        },
        {
            label: "Teaching",
            href: "/teacher",
            role: Role.SUBJECT_TEACHER,
            isActive: pathname.startsWith("/teacher"),
        },
        {
            label: "Homeroom",
            href: "/homeroom",
            role: Role.HOMEROOM_TEACHER,
            isActive: pathname.startsWith("/homeroom"),
        },
        {
            label: "Student",
            href: "/student",
            role: Role.STUDENT,
            isActive: pathname.startsWith("/student"),
        },
        {
            label: "Family",
            href: "/parent",
            role: Role.PARENT,
            isActive: pathname.startsWith("/parent"),
        },
    ]

    // Filter tabs based on user roles
    const visibleTabs = tabs.filter((tab) => roles.includes(tab.role))

    return (

        <div className="relative border-b bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between z-10 sticky top-0 gap-4">
            {/* Branding */}
            <div className="flex items-center gap-2 min-w-fit">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    J
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">JALMS</h1>
            </div>

            {/* Tabs - Centered in available space */}
            <div className="flex-1 flex justify-center min-w-0 overflow-x-auto no-scrollbar mx-4">
                {visibleTabs.length > 0 && (
                    <div className="flex items-center p-1 bg-gray-100/80 border border-gray-200 rounded-full shadow-inner whitespace-nowrap">
                        {visibleTabs.map((tab) => (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                                    tab.isActive
                                        ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                                )}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4 min-w-fit justify-end">
                <UserSettings email={userEmail} name={userName} />
            </div>
        </div>
    )
}
