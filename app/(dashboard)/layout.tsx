import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { WorkspaceTabs } from "@/components/workspace-tabs"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MobileNav } from "@/components/mobile-nav"

import { getTeacherActiveCourses } from "@/lib/actions/teacher.actions"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) redirect("/login")

    const userRoles = session.user?.roles || []

    let teacherCourses: any[] = []
    if (userRoles.includes("SUBJECT_TEACHER") && session.user?.id) {
        const res = await getTeacherActiveCourses(session.user.id)
        if (res.courses) teacherCourses = res.courses
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

    return (
        <div className="flex h-screen flex-col">
            {/* Mobile Navigation */}
            <div className="md:hidden">
                <MobileNav
                    userRoles={userRoles}
                    courses={allCourses}
                    userEmail={session.user?.email}
                    userName={session.user?.name}
                />
            </div>

            {/* Top Navigation Tabs (Desktop only) */}
            <div className="hidden md:!block">
                <WorkspaceTabs
                    roles={userRoles}
                    userName={session.user?.name}
                    userEmail={session.user?.email}
                />
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Desktop only) */}
                <div className="hidden md:!flex">
                    <DashboardSidebar
                        userRoles={userRoles}
                        courses={allCourses}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
