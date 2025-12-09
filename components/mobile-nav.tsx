"use client"

import { usePathname } from "next/navigation"

interface MobileNavProps {
    userRoles: any[] // Kept for consistency but seemingly unused in simplified logic? actually I removed userRoles usage in my previous replace, but I kept the prop in function signature. 
    // Wait, in previous replace I wrote `export function MobileNav({ userRoles }: MobileNavProps)`.
    // The simplified logic I wrote doesn't use `userRoles`. I can remove it.
    // But layout.tsx passes it. I should keep it to avoid Type Error in layout. or just make it optional/ignore.
}


export function MobileNav({ userRoles }: MobileNavProps) {
    const pathname = usePathname()

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

    if (!currentTab) return null

    return (
        <div className="md:hidden px-4 py-3 bg-white/80 backdrop-blur-md text-gray-900 flex items-center justify-start sticky top-0 z-50 border-b border-gray-200">
            <span className="font-semibold text-sm truncate">
                {currentTab.label}
            </span>
        </div>
    )
}
