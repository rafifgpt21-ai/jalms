import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { WorkspaceTabs } from "@/components/workspace-tabs"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ChatNotificationProvider } from "@/components/chat/chat-notification-provider"
import { MobileHeaderProvider } from "@/components/mobile-header-context"
import { DashboardContent } from "@/components/dashboard-content"

import { getTeacherActiveCourses } from "@/lib/actions/teacher.actions"

import { db } from "@/lib/db"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) redirect("/login")

    let userRoles = session.user?.roles || []

    // Fetch fresh roles to ensure UI updates immediately
    if (session.user?.id) {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            select: { roles: true }
        })
        if (user) {
            userRoles = user.roles
        }
    }

    let teacherCourses: any[] = []
    if (userRoles.includes("SUBJECT_TEACHER") && session.user?.id) {
        const res = await getTeacherActiveCourses(session.user.id)
        if (res.courses) teacherCourses = res.courses
    }

    let conversations: any[] = []
    if (session.user?.id) {
        // We need to dynamically import this to avoid circular dependencies if any
        const { getConversations } = await import("@/app/actions/chat")
        conversations = await getConversations()
    }

    let studentCourses: any[] = []
    if (userRoles.includes("STUDENT") && session.user?.id) {
        // We need to import this dynamically or just import it at top
        // But wait, we can just import it.
        const { getStudentCourses } = await import("@/lib/actions/student.actions")
        const res = await getStudentCourses()
        if (res.courses) studentCourses = res.courses
    }

    // Combine courses for sidebar if user has both roles (edge case, but good to handle)
    // Deduplicate by ID to avoid showing the same course twice if user is both teacher and student
    const allCoursesRaw = [...teacherCourses, ...studentCourses]
    const allCourses = allCoursesRaw.filter((course, index, self) =>
        index === self.findIndex((t) => (
            t.id === course.id
        ))
    )

    // Calculate unread globally
    const hasUnreadMessages = conversations?.some(conv => {
        const lastMessage = conv.messages && conv.messages[0];
        // User not in readByIds of last message
        return lastMessage && session.user?.id && !lastMessage.readByIds?.includes(session.user.id);
    }) || false;

    return (
        <div className="flex h-dvh flex-col">
            <ChatNotificationProvider initialConversations={conversations} userId={session.user?.id || ""}>
                <MobileHeaderProvider>
                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <MobileNav
                            userRoles={userRoles}
                        />
                    </div>

                    {/* Top Navigation Tabs (Desktop only) */}
                    <div className="hidden md:block! absolute top-0 left-0 right-0 z-50 pointer-events-none">
                        <div className="pointer-events-auto">
                            <WorkspaceTabs
                                roles={userRoles}
                                userName={session.user?.name}
                                userNickname={session.user?.nickname}
                                userEmail={session.user?.email}
                                userImage={session.user?.image}
                                hasUnreadMessages={hasUnreadMessages}
                            />
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar (Desktop only) */}
                        <div className="hidden md:flex! pt-16">
                            <DashboardSidebar
                                userRoles={userRoles}
                                teacherCourses={teacherCourses}
                                studentCourses={studentCourses}
                                conversations={conversations}
                                userId={session.user?.id}
                            />
                        </div>
                        {/* Main Content */}
                        <DashboardContent>
                            {children}
                        </DashboardContent>

                    </div>

                    <BottomNavigation
                        roles={userRoles}
                        hasUnreadMessages={hasUnreadMessages}
                        teacherCourses={teacherCourses}
                        studentCourses={studentCourses}
                        userEmail={session.user?.email}
                        userName={session.user?.name}
                        userNickname={session.user?.nickname}
                        userImage={session.user?.image}
                        conversations={conversations}
                        userId={session.user?.id}
                    />
                </MobileHeaderProvider>
            </ChatNotificationProvider>
        </div>
    )
}
