"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import { UserSettings } from "@/components/user-settings"
import { useState, useEffect } from "react"

interface WorkspaceTabsProps {
    roles: Role[]
    userName?: string | null
    userEmail?: string | null
    userImage?: string | null
    hasUnreadMessages?: boolean
}

export function WorkspaceTabs({ roles, userName, userEmail, userImage, hasUnreadMessages = false }: WorkspaceTabsProps) {
    const pathname = usePathname()
    const [optimisticPath, setOptimisticPath] = useState<string | null>(null)

    // Reset optimistic path when actual navigation occurs
    useEffect(() => {
        setOptimisticPath(null)
    }, [pathname])

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
        {
            label: "Socials",
            href: "/socials",
            role: Role.STUDENT, // Placeholder, accessible to all
            isActive: pathname.startsWith("/socials"),
            isPublic: true,
            hasBadge: hasUnreadMessages,
        },
    ]

    // Filter tabs based on user roles
    const visibleTabs = tabs.filter((tab) => (tab as any).isPublic || roles.includes(tab.role))

    return (

        <div className="relative border-b bg-white/80 backdrop-blur-md px-6 py-1 flex items-center justify-between z-10 sticky top-0 gap-4">
            {/* Branding */}
            <div className="flex items-center gap-2 min-w-fit">
                <div className="flex items-center justify-center">
                    <img src="/arsync.svg" alt="Logo" className="h-12 w-auto" />
                </div>
            </div>

            {/* Tabs - Centered in available space */}
            <div className="flex-1 flex justify-center min-w-0 overflow-x-auto no-scrollbar mx-4">
                {visibleTabs.length > 0 && (
                    <div className="flex items-center p-1 bg-gray-100/80 border border-gray-200 rounded-full shadow-inner whitespace-nowrap">
                        {visibleTabs.map((tab) => {
                            const isOptimisticActive = optimisticPath ? optimisticPath.startsWith(tab.href) : tab.isActive
                            const hasBadge = (tab as any).hasBadge

                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    onMouseDown={() => setOptimisticPath(tab.href)}
                                    onClick={() => setOptimisticPath(tab.href)}
                                    className={cn(
                                        "px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 relative",
                                        isOptimisticActive
                                            ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                                    )}
                                >
                                    {tab.label}
                                    {hasBadge && (
                                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4 min-w-fit justify-end">
                <UserSettings email={userEmail} name={userName} image={userImage} />
            </div>
        </div>
    )
}
