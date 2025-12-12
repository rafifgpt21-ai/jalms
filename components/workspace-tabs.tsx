"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import { UserSettings } from "@/components/user-settings"
import { useState, useEffect } from "react"
import { useChatNotification } from "@/components/chat/chat-notification-provider"
import { motion } from "framer-motion"

interface WorkspaceTabsProps {
    roles: Role[]
    userName?: string | null
    userNickname?: string | null
    userEmail?: string | null
    userImage?: string | null
    hasUnreadMessages?: boolean
}

export function WorkspaceTabs({ roles, userName, userNickname, userEmail, userImage, hasUnreadMessages: initialHasUnread = false }: WorkspaceTabsProps) {
    const pathname = usePathname()
    const [optimisticPath, setOptimisticPath] = useState<string | null>(null)

    // Use context
    const { hasUnreadMessages: contextHasUnread } = useChatNotification()
    const hasUnreadMessages = contextHasUnread || initialHasUnread

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

        <div
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            className="relative border-b bg-white/80 px-6 py-1 flex items-center justify-between z-10 top-0 gap-4"
        >
            {/* Branding */}
            <div className="flex items-center gap-2 min-w-fit">
                <div className="flex items-center justify-center">
                    <img src="/arsync.svg" alt="Logo" className="h-12 w-auto" />
                </div>
            </div>

            {/* Tabs - Centered in available space */}
            <div className="flex-1 flex justify-center min-w-0 overflow-x-auto no-scrollbar mx-4">
                {visibleTabs.length > 0 && (
                    <div
                        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                        className="flex items-center p-1 bg-gray-100/50 border border-gray-200/50 rounded-full shadow-inner whitespace-nowrap relative ring-1 ring-black/5"
                    >
                        {visibleTabs.map((tab) => {
                            const isOptimisticActive = optimisticPath ? optimisticPath.startsWith(tab.href) : tab.isActive
                            const hasBadge = (tab as any).hasBadge

                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    onMouseDown={() => setOptimisticPath(tab.href)}
                                    // onClick={() => setOptimisticPath(tab.href)} // Link handles navigation, optimistic state is enough on mouse down or just rely on pathname
                                    className={cn(
                                        "px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 relative z-10",
                                        isOptimisticActive
                                            ? "text-gray-900"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    {isOptimisticActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-full shadow-sm ring-1 ring-black/5 z-[-1]"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{tab.label}</span>
                                    {hasBadge && (
                                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4 min-w-fit justify-end">
                <UserSettings email={userEmail} name={userName} nickname={userNickname} image={userImage} />
            </div>
        </div>
    )
}
