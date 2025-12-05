"use client"

import { usePathname, useRouter } from "next/navigation"
import { Role } from "@prisma/client"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
    LayoutDashboard,
    Users,
    School,
    BookOpen,
    CalendarRange,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Home,
    ListTodo,
    Loader2,
    ChevronDown,
    FileText,
    GraduationCap,
    Clock,
    MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getCourseAssignments } from "@/lib/actions/teacher.actions"
import { AddTaskModal } from "@/components/teacher/add-task-modal"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarNavProps {
    userRoles: Role[]
    isCollapsed?: boolean
    onNavigate?: () => void
    courses?: any[]
}

export function SidebarNav({ userRoles, isCollapsed, onNavigate, courses = [] }: SidebarNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

    // Teacher specific state
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
    const [assignments, setAssignments] = useState<any[]>([])
    const [tasksExpanded, setTasksExpanded] = useState(false)


    // Reset navigating state when pathname changes
    if (navigatingTo === pathname) {
        setNavigatingTo(null)
    }

    // Auto-select course based on URL
    useEffect(() => {
        if (pathname.startsWith("/teacher/courses/") || pathname.startsWith("/student/courses/")) {
            const courseId = pathname.split("/")[3]
            if (courseId && courses.some(c => c.id === courseId)) {
                setSelectedCourseId(courseId)
                setTasksExpanded(true) // Expand tasks by default when in a course
            }
        }
    }, [pathname, courses])

    // Fetch assignments when course changes or path changes (to catch updates after navigation)
    useEffect(() => {
        if (selectedCourseId) {
            getCourseAssignments(selectedCourseId).then(res => {
                if (res.assignments) setAssignments(res.assignments)
            })
        } else {
            setAssignments([])
        }
    }, [selectedCourseId, pathname])

    // Helper to check active context
    const isAdmin = pathname.startsWith("/admin")
    const isTeacher = pathname.startsWith("/teacher")
    const isHomeroom = pathname.startsWith("/homeroom")
    const isStudent = pathname.startsWith("/student")

    const NavItem = ({ href, icon: Icon, label, active, onClick }: { href: string, icon: any, label: string, active: boolean, onClick?: () => void }) => {
        const isNavigating = navigatingTo === href
        const isActive = active || isNavigating

        const handleClick = (e: React.MouseEvent) => {
            if (onClick) {
                e.preventDefault()
                onClick()
                return
            }
            if (pathname !== href) {
                setNavigatingTo(href)
            }
            onNavigate?.()
        }

        if (isCollapsed) {
            return (
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <Link
                                href={href}
                                onClick={handleClick}
                                className={cn(
                                    "flex items-center justify-center p-2 rounded-md hover:bg-gray-800 transition-colors relative",
                                    isActive && "bg-gray-800 text-blue-400"
                                )}
                            >
                                {isNavigating ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Icon className="h-5 w-5" />
                                )}
                                <span className="sr-only">{label}</span>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {label}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }

        return (
            <Link
                href={href}
                onClick={handleClick}
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm relative",
                    isActive && "bg-gray-800 text-blue-400"
                )}
            >
                {isNavigating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Icon className="h-4 w-4" />
                )}
                <span>{label}</span>
            </Link>
        )
    }

    return (
        <nav className="space-y-2">
            {/* Admin Section */}
            {userRoles.includes("ADMIN") && isAdmin && (
                <div className="space-y-1">
                    <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" active={pathname === "/admin"} />
                    <NavItem href="/admin/users" icon={Users} label="User Management" active={pathname.startsWith("/admin/users")} />
                    <NavItem href="/admin/classes" icon={School} label="Classrooms" active={pathname.startsWith("/admin/classes")} />
                    <NavItem href="/admin/courses" icon={BookOpen} label="Courses" active={pathname.startsWith("/admin/courses")} />
                    <NavItem href="/admin/semesters" icon={CalendarRange} label="Semesters" active={pathname.startsWith("/admin/semesters")} />
                    <NavItem href="/admin/schedule" icon={Calendar} label="Schedule Manager" active={pathname.startsWith("/admin/schedule")} />
                    <NavItem href="/admin/socials" icon={MessageSquare} label="Socials Monitoring" active={pathname.startsWith("/admin/socials")} />
                </div>
            )}

            {/* Subject Teacher Section */}
            {userRoles.includes("SUBJECT_TEACHER") && isTeacher && (
                <div className="space-y-4">
                    <div className="space-y-1">
                        <NavItem href="/teacher" icon={LayoutDashboard} label="Dashboard" active={pathname === "/teacher"} />
                        <NavItem href="/teacher/attendance" icon={Clock} label="Daily Attendance" active={pathname === "/teacher/attendance"} />
                        <NavItem href="/teacher/attendance" icon={Clock} label="Daily Attendance" active={pathname === "/teacher/attendance"} />
                        <NavItem href="/teacher/materials" icon={FileText} label="Study Materials" active={pathname === "/teacher/materials"} />
                        <NavItem href="/socials" icon={MessageSquare} label="Socials" active={pathname.startsWith("/socials")} />
                    </div>

                    {isCollapsed ? (
                        <div className="px-2 flex justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-white hover:bg-gray-800">
                                        <BookOpen className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" className="w-56 bg-gray-900 border-gray-800 text-white">
                                    <DropdownMenuLabel>Select Course</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-800" />
                                    {courses.map(course => (
                                        <DropdownMenuItem
                                            key={course.id}
                                            onClick={() => setSelectedCourseId(course.id)}
                                            className="hover:bg-gray-800 cursor-pointer focus:bg-gray-800 focus:text-white"
                                        >
                                            {course.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="px-2">
                            <Select
                                value={selectedCourseId || ""}
                                onValueChange={(val) => {
                                    setSelectedCourseId(val)
                                    // Optional: Navigate to course home or just expand menu
                                    // router.push(`/teacher/courses/${val}`)
                                }}
                            >
                                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedCourseId && (
                        <div className="space-y-1">
                            {/* Tasks Menu */}
                            <div className="space-y-1">
                                {isCollapsed ? (
                                    <div className="flex justify-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className={cn("h-10 w-10 hover:bg-gray-800", tasksExpanded ? "text-white" : "text-gray-400")}>
                                                    <ListTodo className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="right" className="w-56 bg-gray-900 border-gray-800 text-white">
                                                <DropdownMenuLabel>Tasks</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-gray-800" />
                                                {assignments.map(assignment => (
                                                    <DropdownMenuItem key={assignment.id} asChild>
                                                        <Link
                                                            href={`/teacher/courses/${selectedCourseId}/tasks/${assignment.id}`}
                                                            className={cn(
                                                                "w-full cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white",
                                                                pathname.includes(`/tasks/${assignment.id}`) ? "text-blue-400" : "text-gray-400"
                                                            )}
                                                        >
                                                            {assignment.title}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                                <div className="p-2 border-t border-gray-800">
                                                    <AddTaskModal
                                                        courseId={selectedCourseId}
                                                        onSuccess={() => {
                                                            // Refresh assignments
                                                            getCourseAssignments(selectedCourseId).then(res => {
                                                                if (res.assignments) setAssignments(res.assignments)
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setTasksExpanded(!tasksExpanded)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-300",
                                                tasksExpanded && "text-white"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <ListTodo className="h-4 w-4" />
                                                <span>Tasks</span>
                                            </div>
                                            <ChevronDown className={cn("h-4 w-4 transition-transform", !tasksExpanded && "-rotate-90")} />
                                        </button>

                                        {tasksExpanded && (
                                            <div className="pl-9 space-y-1">
                                                {assignments.map(assignment => (
                                                    <Link
                                                        key={assignment.id}
                                                        href={`/teacher/courses/${selectedCourseId}/tasks/${assignment.id}`}
                                                        className={cn(
                                                            "block px-2 py-1.5 text-sm rounded-md hover:bg-gray-800 hover:text-white transition-colors truncate",
                                                            pathname.includes(`/tasks/${assignment.id}`) ? "text-blue-400" : "text-gray-400"
                                                        )}
                                                    >
                                                        {assignment.title}
                                                    </Link>
                                                ))}
                                                <div className="pt-1">
                                                    <AddTaskModal
                                                        courseId={selectedCourseId}
                                                        onSuccess={() => {
                                                            // Refresh assignments
                                                            getCourseAssignments(selectedCourseId).then(res => {
                                                                if (res.assignments) setAssignments(res.assignments)
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <NavItem href={`/teacher/courses/${selectedCourseId}/attendance`} icon={Clock} label="Attendance" active={pathname.startsWith(`/teacher/courses/${selectedCourseId}/attendance`)} />
                            <NavItem href={`/teacher/courses/${selectedCourseId}/gradebook`} icon={GraduationCap} label="Gradebook" active={pathname.startsWith(`/teacher/courses/${selectedCourseId}/gradebook`)} />
                        </div>
                    )}
                </div>
            )}

            {/* Homeroom Teacher Section */}
            {userRoles.includes("HOMEROOM_TEACHER") && isHomeroom && (
                <div className="space-y-1">
                    <NavItem href="/homeroom" icon={Home} label="My Class" active={pathname === "/homeroom"} />
                </div>
            )}

            {/* Student Section */}
            {userRoles.includes("STUDENT") && isStudent && (
                <div className="space-y-4">
                    <div className="space-y-1">
                        <NavItem href="/student" icon={LayoutDashboard} label="Dashboard" active={pathname === "/student"} />
                        <NavItem href="/student/attendance" icon={Clock} label="Attendance" active={pathname === "/student/attendance"} />
                        <NavItem href="/student/attendance" icon={Clock} label="Attendance" active={pathname === "/student/attendance"} />
                        <NavItem href="/student/grades" icon={GraduationCap} label="Grades" active={pathname === "/student/grades"} />
                        <NavItem href="/socials" icon={MessageSquare} label="Socials" active={pathname.startsWith("/socials")} />
                    </div>

                    {isCollapsed ? (
                        <div className="px-2 flex justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-white hover:bg-gray-800">
                                        <BookOpen className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" className="w-56 bg-gray-900 border-gray-800 text-white">
                                    <DropdownMenuLabel>Select Course</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-gray-800" />
                                    {courses.map(course => (
                                        <DropdownMenuItem
                                            key={course.id}
                                            onClick={() => setSelectedCourseId(course.id)}
                                            className="hover:bg-gray-800 cursor-pointer focus:bg-gray-800 focus:text-white"
                                        >
                                            {course.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="px-2">
                            <Select
                                value={selectedCourseId || ""}
                                onValueChange={(val) => {
                                    setSelectedCourseId(val)
                                }}
                            >
                                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedCourseId && (
                        <div className="space-y-1">
                            {/* Tasks Menu */}
                            <div className="space-y-1">
                                {isCollapsed ? (
                                    <div className="flex justify-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className={cn("h-10 w-10 hover:bg-gray-800", tasksExpanded ? "text-white" : "text-gray-400")}>
                                                    <ListTodo className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="right" className="w-56 bg-gray-900 border-gray-800 text-white">
                                                <DropdownMenuLabel>Tasks</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-gray-800" />
                                                {assignments.map(assignment => (
                                                    <DropdownMenuItem key={assignment.id} asChild>
                                                        <Link
                                                            href={`/student/courses/${selectedCourseId}/tasks/${assignment.id}`}
                                                            className={cn(
                                                                "w-full cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white",
                                                                pathname.includes(`/tasks/${assignment.id}`) ? "text-blue-400" : "text-gray-400"
                                                            )}
                                                        >
                                                            {assignment.title}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setTasksExpanded(!tasksExpanded)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-300",
                                                tasksExpanded && "text-white"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <ListTodo className="h-4 w-4" />
                                                <span>Tasks</span>
                                            </div>
                                            <ChevronDown className={cn("h-4 w-4 transition-transform", !tasksExpanded && "-rotate-90")} />
                                        </button>

                                        {tasksExpanded && (
                                            <div className="pl-9 space-y-1">
                                                {assignments.map(assignment => (
                                                    <Link
                                                        key={assignment.id}
                                                        href={`/student/courses/${selectedCourseId}/tasks/${assignment.id}`}
                                                        className={cn(
                                                            "block px-2 py-1.5 text-sm rounded-md hover:bg-gray-800 hover:text-white transition-colors truncate",
                                                            pathname.includes(`/tasks/${assignment.id}`) ? "text-blue-400" : "text-gray-400"
                                                        )}
                                                    >
                                                        {assignment.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <NavItem href={`/student/courses/${selectedCourseId}/materials`} icon={FileText} label="Study Materials" active={pathname.includes("/materials")} />
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}

interface DashboardSidebarProps {
    userRoles: Role[]
    courses?: any[]
    conversations?: any[]
    userId?: string
}

export function DashboardSidebar({ userRoles, courses, conversations = [], userId }: DashboardSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()
    const isSocials = pathname.startsWith("/socials")

    return (
        <aside
            className={cn(
                "bg-gray-900 text-white flex flex-col transition-all duration-300 relative border-r border-gray-800",
                isCollapsed ? "w-16" : "w-80" // Wider for chat
            )}
        >
            <div className="flex-1 overflow-y-auto">
                {isSocials && userId ? (
                    <ChatSidebar
                        initialConversations={conversations}
                        userId={userId}
                        variant="sidebar"
                        isCollapsed={isCollapsed}
                    />
                ) : (
                    <div className="p-4">
                        <SidebarNav userRoles={userRoles} isCollapsed={isCollapsed} courses={courses} />
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-800">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
        </aside>
    )
}
