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
    MessageSquare,
    Plus,
    PieChart,
    Library,
    Table,
    FileQuestion
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
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { useChatNotification } from "@/components/chat/chat-notification-provider"
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
    teacherCourses?: any[]
    studentCourses?: any[]
    isMobile?: boolean
    hasUnreadMessages?: boolean
}

export function SidebarNav({ userRoles, isCollapsed, onNavigate, teacherCourses = [], studentCourses = [], isMobile = false, hasUnreadMessages = false }: SidebarNavProps) {
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
        if (pathname.startsWith("/teacher/courses/")) {
            const courseId = pathname.split("/")[3]
            if (courseId && teacherCourses.some(c => c.id === courseId)) {
                setSelectedCourseId(courseId)
                setTasksExpanded(true)
            }
        } else if (pathname.startsWith("/student/courses/")) {
            const courseId = pathname.split("/")[3]
            if (courseId && studentCourses.some(c => c.id === courseId)) {
                setSelectedCourseId(courseId)
            }
        }
    }, [pathname, teacherCourses, studentCourses])

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

    const NavItem = ({ href, icon: Icon, label, active, onClick, hasBadge }: { href: string, icon: any, label: string, active: boolean, onClick?: () => void, hasBadge?: boolean }) => {
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
                                    "flex items-center justify-center p-3 rounded-md transition-all duration-200 relative group",
                                    isActive
                                        ? "bg-linear-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400"
                                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                                )}
                            >
                                {isNavigating ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <div className="relative">
                                        <Icon className={cn("h-5 w-5", isActive && "text-blue-600 dark:text-blue-400")} />
                                        {hasBadge && (
                                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                                        )}
                                    </div>
                                )}
                                <span className="sr-only">{label}</span>
                                {isActive && (
                                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-500" />
                                )}
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {label}
                            {hasBadge && " (Unread)"}
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
                    "flex items-center gap-3 rounded-md transition-all duration-200 relative overflow-hidden px-4 py-3 text-base",
                    isActive
                        ? "bg-linear-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 font-medium"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                )}
            >
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                )}
                {isNavigating ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                    <div className="relative">
                        <Icon className={cn("h-5 w-5", isActive && "text-blue-600 dark:text-blue-400")} />
                        {hasBadge && (
                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                        )}
                    </div>
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
                    <NavItem href="/admin/subjects" icon={Library} label="Subjects" active={pathname.startsWith("/admin/subjects")} />
                    <NavItem href="/admin/courses" icon={BookOpen} label="Courses" active={pathname.startsWith("/admin/courses")} />
                    <NavItem href="/admin/semesters" icon={CalendarRange} label="Semesters" active={pathname.startsWith("/admin/semesters")} />
                    <NavItem href="/admin/schedule" icon={Calendar} label="Schedule Manager" active={pathname === "/admin/schedule" || pathname.startsWith("/admin/schedule/") && !pathname.includes("overview")} />
                    <NavItem href="/admin/schedule/overview" icon={Table} label="Master Timetable" active={pathname.startsWith("/admin/schedule/overview")} />
                    <NavItem href="/admin/socials" icon={MessageSquare} label="Socials Monitoring" active={pathname.startsWith("/admin/socials")} hasBadge={hasUnreadMessages} />
                </div>
            )}

            {/* Subject Teacher Section */}
            {userRoles.includes("SUBJECT_TEACHER") && isTeacher && (
                <div className="space-y-4">
                    <div className="space-y-1">
                        <NavItem href="/teacher" icon={LayoutDashboard} label="Dashboard" active={pathname === "/teacher"} />
                        <NavItem href="/teacher/attendance" icon={Clock} label="Daily Attendance" active={pathname === "/teacher/attendance"} />
                        <NavItem href="/teacher/quiz-manager" icon={FileQuestion} label="Quiz Manager" active={pathname.startsWith("/teacher/quiz-manager")} />
                        <NavItem href="/teacher/materials" icon={FileText} label="Study Materials" active={pathname === "/teacher/materials"} />
                    </div>

                    {isCollapsed ? (
                        <div className="px-2 flex justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent">
                                        <BookOpen className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" className="w-56 bg-sidebar border-sidebar-border text-sidebar-foreground">
                                    <DropdownMenuLabel>Select Course</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-sidebar-border" />
                                    {teacherCourses.map(course => (
                                        <DropdownMenuItem
                                            key={course.id}
                                            onClick={() => setSelectedCourseId(course.id)}
                                            className="hover:bg-sidebar-accent cursor-pointer focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
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
                                <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teacherCourses.map(course => (
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
                                                <div
                                                    className={cn(
                                                        "h-10 w-10 flex items-center justify-center rounded-md transition-all duration-200 relative group cursor-pointer",
                                                        pathname.includes("/tasks") && !pathname.includes("/tasks-summary")
                                                            ? "bg-linear-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400"
                                                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                                                    )}
                                                >
                                                    <ListTodo className={cn("h-5 w-5", pathname.includes("/tasks") && !pathname.includes("/tasks-summary") && "text-blue-600 dark:text-blue-400")} />
                                                    {pathname.includes("/tasks") && !pathname.includes("/tasks-summary") && (
                                                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-500" />
                                                    )}
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="right" className="w-56 bg-sidebar border-sidebar-border text-sidebar-foreground">
                                                <DropdownMenuLabel>Tasks</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-sidebar-border" />
                                                {assignments.map(assignment => (
                                                    <DropdownMenuItem key={assignment.id} asChild>
                                                        <Link
                                                            href={`/teacher/courses/${selectedCourseId}/tasks/${assignment.id}`}
                                                            className={cn(
                                                                "w-full cursor-pointer hover:bg-sidebar-accent focus:bg-sidebar-accent focus:text-sidebar-accent-foreground",
                                                                pathname.includes(`/tasks/${assignment.id}`) ? "text-sidebar-primary" : "text-muted-foreground"
                                                            )}
                                                        >
                                                            {assignment.title}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                                <div className="p-2 border-t border-sidebar-border">
                                                    <Link
                                                        href={`/teacher/courses/${selectedCourseId}/tasks/new`}
                                                        className="w-full flex items-center justify-start px-2 py-1.5 text-sm rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Task
                                                    </Link>
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setTasksExpanded(!tasksExpanded)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 relative overflow-hidden text-base",
                                                pathname.includes("/tasks") && !pathname.includes("/tasks-summary")
                                                    ? "bg-linear-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 font-medium"
                                                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                                            )}
                                        >
                                            {pathname.includes("/tasks") && !pathname.includes("/tasks-summary") && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                                            )}
                                            <div className="flex items-center gap-3">
                                                <ListTodo className={cn("h-5 w-5", pathname.includes("/tasks") && !pathname.includes("/tasks-summary") && "text-blue-600 dark:text-blue-400")} />
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
                                                            "block px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors truncate",
                                                            pathname.includes(`/tasks/${assignment.id}`) ? "text-sidebar-primary font-medium" : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {assignment.title}
                                                    </Link>
                                                ))}
                                                <div className="pt-1">
                                                    <Link
                                                        href={`/teacher/courses/${selectedCourseId}/tasks/new`}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        Add Task
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <NavItem href={`/teacher/courses/${selectedCourseId}/tasks-summary`} icon={Table} label="Tasks Summary" active={pathname.startsWith(`/teacher/courses/${selectedCourseId}/tasks-summary`)} />
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
                        <NavItem href="/student/learning-profile" icon={PieChart} label="Learning Profile" active={pathname === "/student/learning-profile"} />
                        <NavItem href="/student/attendance" icon={Clock} label="Attendance" active={pathname === "/student/attendance"} />
                        <NavItem href="/student/grades" icon={GraduationCap} label="Grades" active={pathname === "/student/grades"} />
                        <NavItem href="/student/schedule" icon={Calendar} label="Schedule" active={pathname === "/student/schedule"} />
                    </div>

                    {isCollapsed ? (
                        <div className="px-2 flex justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent">
                                        <BookOpen className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="right" className="w-56 bg-sidebar border-sidebar-border text-sidebar-foreground">
                                    <DropdownMenuLabel>Select Course</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-sidebar-border" />
                                    {studentCourses.map(course => (
                                        <DropdownMenuItem
                                            key={course.id}
                                            onClick={() => setSelectedCourseId(course.id)}
                                            className="hover:bg-sidebar-accent cursor-pointer focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
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
                                <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {studentCourses.map(course => (
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
                                                <div
                                                    className={cn(
                                                        "h-10 w-10 flex items-center justify-center rounded-md transition-all duration-200 relative group cursor-pointer",
                                                        pathname.includes("/tasks")
                                                            ? "bg-linear-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400"
                                                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                                                    )}
                                                >
                                                    <ListTodo className={cn("h-5 w-5", pathname.includes("/tasks") && "text-blue-600 dark:text-blue-400")} />
                                                    {pathname.includes("/tasks") && (
                                                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-500" />
                                                    )}
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="right" className="w-56 bg-sidebar border-sidebar-border text-sidebar-foreground">
                                                <DropdownMenuLabel>Tasks</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-sidebar-border" />
                                                {assignments.map(assignment => (
                                                    <DropdownMenuItem key={assignment.id} asChild>
                                                        <Link
                                                            href={`/student/courses/${selectedCourseId}/tasks/${assignment.id}`}
                                                            className={cn(
                                                                "w-full cursor-pointer hover:bg-sidebar-accent focus:bg-sidebar-accent focus:text-sidebar-accent-foreground",
                                                                pathname.includes(`/tasks/${assignment.id}`) ? "text-sidebar-primary" : "text-muted-foreground"
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
                                                "w-full flex items-center justify-between px-4 py-3 rounded-md transition-all duration-200 relative overflow-hidden text-base",
                                                pathname.includes("/tasks")
                                                    ? "bg-linear-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400 font-medium"
                                                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                                            )}
                                        >
                                            {pathname.includes("/tasks") && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                                            )}
                                            <div className="flex items-center gap-3">
                                                <ListTodo className={cn("h-5 w-5", pathname.includes("/tasks") && "text-blue-600 dark:text-blue-400")} />
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
                                                            "block px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors truncate",
                                                            pathname.includes(`/tasks/${assignment.id}`) ? "text-sidebar-primary" : "text-muted-foreground"
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
    teacherCourses?: any[]
    studentCourses?: any[]
    conversations?: any[]
    userId?: string
}

export function DashboardSidebar({ userRoles, teacherCourses, studentCourses, conversations: initialConversations = [], userId }: DashboardSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()
    const isSocials = pathname.startsWith("/socials")

    // Use context for real-time updates
    const { conversations, hasUnreadMessages } = useChatNotification()

    // Fallback to initial props if context is empty (shouldn't happen if provider is working)
    const activeConversations = conversations.length > 0 ? conversations : initialConversations;

    return (
        <aside
            className={cn(
                "bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 relative border-r border-sidebar-border",
                isCollapsed ? "w-16" : "w-80" // Wider for chat
            )}
        >
            <div className="flex-1 overflow-y-auto">
                {isSocials && userId ? (
                    <ChatSidebar
                        initialConversations={activeConversations}
                        userId={userId}
                        variant="sidebar"
                        isCollapsed={isCollapsed}
                        headerMode="show"
                    />
                ) : (
                    <div className={cn("p-4", isCollapsed && "p-2")}>
                        <div className={cn("p-4", isCollapsed && "p-2")}>
                            <SidebarNav userRoles={userRoles} isCollapsed={isCollapsed} teacherCourses={teacherCourses} studentCourses={studentCourses} hasUnreadMessages={hasUnreadMessages} />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-sidebar-border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-accent-foreground"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
        </aside>
    )
}
