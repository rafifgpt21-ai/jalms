"use client"

import { usePathname } from "next/navigation"
import { useMobileHeader } from "@/components/mobile-header-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MobileNavProps {
    userRoles: any[]
}


export function MobileNav({ userRoles }: MobileNavProps) {
    const pathname = usePathname()
    const { title, subtitle, image, leftAction, rightAction } = useMobileHeader()

    const tabs = [
        {
            label: "Admin Workspace",
            href: "/admin",
            isActive: pathname.startsWith("/admin"),
        },
        {
            label: "Teaching Workspace",
            href: "/teacher",
            isActive: pathname.startsWith("/teacher"),
        },
        {
            label: "Homeroom Workspace",
            href: "/homeroom",
            isActive: pathname.startsWith("/homeroom"),
        },
        {
            label: "Student Workspace",
            href: "/student",
            isActive: pathname.startsWith("/student"),
        },
        {
            label: "Family Workspace",
            href: "/parent",
            isActive: pathname.startsWith("/parent"),
        },
        {
            label: "Socials",
            href: "/socials",
            isActive: pathname.startsWith("/socials"),
        },
    ]

    const currentTab = tabs.find(tab => tab.isActive)

    if (title) {
        return (
            <div style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }} className="md:hidden px-4 py-2 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 flex items-center gap-3 sticky top-0 z-50 border-b border-white/20 dark:border-white/10 min-h-[56px] shadow-sm">
                {leftAction}
                {image && (
                    <Avatar className="h-8 w-8 border border-gray-200">
                        <AvatarImage src={image} />
                        <AvatarFallback className="text-xs">{typeof title === 'string' ? title.slice(0, 2).toUpperCase() : '?'}</AvatarFallback>
                    </Avatar>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-sm truncate leading-tight">
                        {title}
                    </span>
                    {subtitle && (
                        <span className="text-xs text-gray-500 truncate leading-tight">
                            {subtitle}
                        </span>
                    )}
                </div>
                {rightAction && (
                    <div className="flex items-center gap-1 -mr-2">
                        {rightAction}
                    </div>
                )}
            </div>
        )
    }

    if (!currentTab) return null

    return (
        <div
            style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            className="md:hidden px-4 py-3 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 flex items-center justify-start sticky top-0 z-50 border-b border-white/20 dark:border-white/10 h-[56px] shadow-sm"
        >
            <span className="font-semibold text-sm truncate">
                {currentTab.label}
            </span>
        </div>
    )
}
