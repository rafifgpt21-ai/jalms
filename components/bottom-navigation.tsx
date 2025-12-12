"use client"

import { useState } from "react"

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
    MessageSquare,
    Menu,
    X
} from "lucide-react"

import { useChatNotification } from "@/components/chat/chat-notification-provider"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/dashboard-sidebar"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { UserSettings } from "@/components/user-settings"

interface BottomNavigationProps {
    roles: Role[]
    hasUnreadMessages?: boolean
    teacherCourses?: any[]
    studentCourses?: any[]
    userEmail?: string | null
    userName?: string | null
    userNickname?: string | null
    userImage?: string | null
    conversations?: any[]
    userId?: string
}

export function BottomNavigation({
    roles,
    hasUnreadMessages: initialHasUnread = false,
    teacherCourses,
    studentCourses,
    userEmail,
    userName,
    userNickname,
    userImage,
    conversations: initialConversations = [],
    userId
}: BottomNavigationProps) {
    const pathname = usePathname()
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
    const [open, setOpen] = useState(false)
    const isSocials = pathname.startsWith("/socials")

    // Reset navigating state when pathname changes
    if (navigatingTo === pathname) {
        setNavigatingTo(null)
    }

    // Use context
    const { conversations, hasUnreadMessages: contextHasUnread } = useChatNotification()
    const hasUnreadMessages = contextHasUnread || initialHasUnread
    const activeConversations = conversations.length > 0 ? conversations : initialConversations


    const tabs = [
        {
            label: "Admin",
            href: "/admin",
            role: Role.ADMIN,
            icon: LayoutDashboard,
            isActive: (navigatingTo === "/admin" || (pathname.startsWith("/admin") && navigatingTo === null)),
        },
        {
            label: "Teaching",
            href: "/teacher",
            role: Role.SUBJECT_TEACHER,
            icon: BookOpen,
            isActive: (navigatingTo === "/teacher" || (pathname.startsWith("/teacher") && navigatingTo === null)),
        },
        {
            label: "Homeroom",
            href: "/homeroom",
            role: Role.HOMEROOM_TEACHER,
            icon: Home,
            isActive: (navigatingTo === "/homeroom" || (pathname.startsWith("/homeroom") && navigatingTo === null)),
        },
        {
            label: "Student",
            href: "/student",
            role: Role.STUDENT,
            icon: GraduationCap,
            isActive: (navigatingTo === "/student" || (pathname.startsWith("/student") && navigatingTo === null)),
        },
        {
            label: "Family",
            href: "/parent",
            role: Role.PARENT,
            icon: Users,
            isActive: (navigatingTo === "/parent" || (pathname.startsWith("/parent") && navigatingTo === null)),
        },
        {
            label: "Socials",
            href: "/socials",
            role: Role.STUDENT, // Placeholder, accessible to all
            icon: MessageSquare,
            isActive: (navigatingTo === "/socials" || (pathname.startsWith("/socials") && navigatingTo === null)),
            isPublic: true,
            hasBadge: hasUnreadMessages,
        },
    ]

    // Filter tabs based on user roles
    const visibleTabs = tabs.filter((tab) => (tab as any).isPublic || roles.includes(tab.role))

    if (visibleTabs.length === 0) return null

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 dark:border-white/10 z-100 pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
            <div className="flex items-center h-16">
                {/* Fixed Menu Button (Left) */}
                <div className="flex-none w-16 border-r border-gray-100 flex items-center justify-center h-full p-0">
                    <Sheet open={open} onOpenChange={setOpen} modal={false}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full h-full rounded-none flex items-center justify-center transition-all duration-200",
                                    open
                                        ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                                        : "bg-indigo-50/50 hover:bg-indigo-100/50 text-indigo-600/70"
                                )}
                                suppressHydrationWarning
                            >
                                <div className={cn(
                                    "transition-transform duration-300 ease-in-out transform",
                                    open ? "rotate-90 scale-110" : "rotate-0 scale-100"
                                )}>
                                    {open ? <X className="h-10 w-10" /> : <Menu className="h-10 w-10" />}
                                </div>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[85vw] sm:w-80 bg-sidebar text-sidebar-foreground border-r-sidebar-border p-0 flex flex-col h-full inset-y-0 left-0">
                            {/* User Profile Header */}
                            <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/10">
                                <SheetTitle className="sr-only">User Menu</SheetTitle>
                                <SheetDescription className="sr-only">User navigation and settings</SheetDescription>
                                <UserSettings
                                    email={userEmail}
                                    name={userName}
                                    nickname={userNickname}
                                    image={userImage}
                                    triggerVariant="card"
                                    side="bottom"
                                    align="start"
                                />
                            </div>

                            {/* Sidebar Content */}
                            <div className="flex-1 overflow-y-auto min-h-0">
                                {isSocials && userId ? (
                                    <ChatSidebar
                                        initialConversations={activeConversations}
                                        userId={userId}
                                        variant="sidebar"
                                        disableMobileHeader={true}
                                        headerMode="show"
                                    />
                                ) : (
                                    <div className="px-4 py-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block px-2">
                                            Menu
                                        </label>
                                        <SidebarNav
                                            userRoles={roles}
                                            onNavigate={() => setOpen(false)}
                                            teacherCourses={teacherCourses}
                                            studentCourses={studentCourses}
                                            isMobile={true}
                                            hasUnreadMessages={hasUnreadMessages}
                                        />
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Scrollable Navigation Items (Right) */}
                <div className="flex-1 overflow-x-auto flex items-center justify-start px-2 gap-4 h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {visibleTabs.map((tab) => {
                        const Icon = tab.icon
                        const hasBadge = (tab as any).hasBadge

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                onClick={() => {
                                    if (pathname !== tab.href) {
                                        setNavigatingTo(tab.href)
                                    }
                                }}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-16 h-full space-y-1 relative transition-colors select-none",
                                    tab.isActive
                                        ? "text-indigo-600 dark:text-indigo-400 font-medium"
                                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
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
        </div>
    )
}
