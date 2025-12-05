"use client"

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, ChevronDown } from "lucide-react"
import { SidebarNav } from "@/components/dashboard-sidebar"
import { Role } from "@prisma/client"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"


import { UserSettings } from "@/components/user-settings"

interface MobileNavProps {
    userRoles: Role[]
    courses?: any[]
    userEmail?: string | null
    userName?: string | null
}

export function MobileNav({ userRoles, courses, userEmail, userName }: MobileNavProps) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const tabs = [
        {
            label: "Admin Workspace",
            href: "/admin",
            role: Role.ADMIN,
            isActive: pathname.startsWith("/admin"),
        },
        {
            label: "Teaching Workspace",
            href: "/teacher",
            role: Role.SUBJECT_TEACHER,
            isActive: pathname.startsWith("/teacher"),
        },
        {
            label: "Homeroom Workspace",
            href: "/homeroom",
            role: Role.HOMEROOM_TEACHER,
            isActive: pathname.startsWith("/homeroom"),
        },
        {
            label: "Student Workspace",
            href: "/student",
            role: Role.STUDENT,
            isActive: pathname.startsWith("/student"),
        },
        {
            label: "Family Workspace",
            href: "/parent",
            role: Role.PARENT,
            isActive: pathname.startsWith("/parent"),
        },
    ]



    const visibleTabs = tabs.filter((tab) => userRoles.includes(tab.role))
    const currentTab = visibleTabs.find(tab => tab.isActive) || visibleTabs[0]

    return (
        <div className="md:hidden px-4 py-2 bg-white/80 backdrop-blur-md text-gray-900 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-900 hover:bg-gray-100 -ml-2">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 bg-gray-900 text-white border-r-gray-800 p-0">
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-gray-800">
                                <SheetTitle className="font-bold text-xl mb-1 text-white">JALMS</SheetTitle>
                                <p className="text-xs text-gray-400">School Management System</p>
                            </div>

                            {/* Workspace Switcher in Drawer */}
                            {visibleTabs.length > 1 && (
                                <div className="px-4 py-4">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block px-2">
                                        Switch Workspace
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                                            >
                                                {currentTab?.label || "Select Workspace"}
                                                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[240px] bg-gray-800 border-gray-700 text-white">
                                            {visibleTabs.map((tab) => (
                                                <DropdownMenuItem
                                                    key={tab.href}
                                                    className={cn(
                                                        "cursor-pointer focus:bg-gray-700 focus:text-white",
                                                        tab.isActive && "bg-gray-700"
                                                    )}
                                                    onClick={() => {
                                                        router.push(tab.href)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    {tab.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto px-4 py-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block px-2">
                                    Menu
                                </label>
                                <SidebarNav userRoles={userRoles} onNavigate={() => setOpen(false)} courses={courses} />
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Current Workspace Title (Visible in Top Bar) */}
                <span className="font-semibold text-sm truncate max-w-[200px]">
                    {currentTab?.label}
                </span>
            </div>

            <UserSettings email={userEmail} name={userName} />
        </div>
    )
}

