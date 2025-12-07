"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"
import {
    LayoutDashboard,
    BookOpen,
    Home,
    GraduationCap,
    Users,
    MessageSquare
} from "lucide-react"

import { useChatNotification } from "@/components/chat/chat-notification-provider"

interface BottomNavigationProps {
    roles: Role[]
    hasUnreadMessages?: boolean
}

export function BottomNavigation({ roles, hasUnreadMessages: initialHasUnread = false }: BottomNavigationProps) {
    const pathname = usePathname()

    // Use context
    const { hasUnreadMessages: contextHasUnread } = useChatNotification()
    const hasUnreadMessages = contextHasUnread || initialHasUnread

    const tabs = [
        {
            label: "Admin",
            href: "/admin",
            role: Role.ADMIN,
            icon: LayoutDashboard,
            isActive: pathname.startsWith("/admin"),
        },
        {
            label: "Teaching",
            href: "/teacher",
            role: Role.SUBJECT_TEACHER,
            icon: BookOpen,
            isActive: pathname.startsWith("/teacher"),
        },
        {
            label: "Homeroom",
            href: "/homeroom",
            role: Role.HOMEROOM_TEACHER,
            icon: Home,
            isActive: pathname.startsWith("/homeroom"),
        },
        {
            label: "Student",
            href: "/student",
            role: Role.STUDENT,
            icon: GraduationCap,
            isActive: pathname.startsWith("/student"),
        },
        {
            label: "Family",
            href: "/parent",
            role: Role.PARENT,
            icon: Users,
            isActive: pathname.startsWith("/parent"),
        },
        {
            label: "Socials",
            href: "/socials",
            role: Role.STUDENT, // Placeholder, accessible to all
            icon: MessageSquare,
            isActive: pathname.startsWith("/socials"),
            isPublic: true,
            hasBadge: hasUnreadMessages,
        },
    ]

    // Filter tabs based on user roles
    const visibleTabs = tabs.filter((tab) => (tab as any).isPublic || roles.includes(tab.role))

    if (visibleTabs.length === 0) return null

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] pb-safe">
            <div className="flex items-center justify-around h-16">
                {visibleTabs.map((tab) => {
                    const Icon = tab.icon
                    const hasBadge = (tab as any).hasBadge

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 relative",
                                tab.isActive
                                    ? "text-blue-600"
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn("h-6 w-6", tab.isActive && "fill-current")} />
                                {hasBadge && (
                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                                )}
                            </div>
                            <span className="sr-only">{tab.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
