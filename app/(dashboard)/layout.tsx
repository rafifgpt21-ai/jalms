import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getTeacherActiveCourses } from "@/lib/actions/teacher.actions"
import { getWorkspacePreference } from "@/lib/actions/workspace-preferences.actions"
import { ChatNotificationProvider } from "@/components/chat/chat-notification-provider"
import { MobileHeaderProvider } from "@/components/mobile-header-context"
import { AppearancePreferenceHydrator } from "@/components/appearance-preference-hydrator"
import { WorkspaceShell } from "@/components/navigation/workspace-shell"
import type { NavigationCourse } from "@/types/navigation"

function orderCourses(courses: NavigationCourse[], order: string[]) {
  const positions = new Map(order.map((id, index) => [id, index]))
  return [...courses].sort((a, b) => {
    const left = positions.get(a.id)
    const right = positions.get(b.id)
    if (left !== undefined || right !== undefined) return (left ?? Number.MAX_SAFE_INTEGER) - (right ?? Number.MAX_SAFE_INTEGER)
    return a.name.localeCompare(b.name)
  })
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userRecord = await db.user.findUnique({
    where: { id: session.user.id },
    select: { roles: true },
  })
  const roles = userRecord?.roles ?? session.user.roles ?? []

  const [teacherResult, studentResult, conversations, workspacePreference, navigationStates] = await Promise.all([
    roles.includes("SUBJECT_TEACHER") ? getTeacherActiveCourses(session.user.id) : Promise.resolve({ courses: [] }),
    roles.includes("STUDENT")
      ? import("@/lib/actions/student.actions").then(({ getStudentCourses }) => getStudentCourses())
      : Promise.resolve({ courses: [] }),
    import("@/app/actions/chat").then(({ getConversations }) => getConversations()),
    getWorkspacePreference(),
    db.courseNavigationState.findMany({ where: { userId: session.user.id } }).catch(() => []),
  ])

  const stateByKey = new Map(navigationStates.map((state) => [`${state.roleContext.toLowerCase()}:${state.courseId}`, state.lastSectionKey]))
  const teacherCourses: NavigationCourse[] = (teacherResult.courses ?? []).map((course: any) => ({
    id: course.id,
    name: course.name,
    reportName: course.reportName,
    roleContext: "teacher",
    subject: course.subject ? { name: course.subject.name, code: course.subject.code } : null,
    class: course.class ? { name: course.class.name, color: course.class.color } : null,
    teacherName: session.user.name,
    iconImageUrl: course.iconImageUrl,
    lastSectionKey: stateByKey.get(`teacher:${course.id}`),
    summary: {
      studentCount: new Set([
        ...course.studentIds,
        ...course.courseEnrollments.map((enrollment: { studentId: string }) => enrollment.studentId),
      ]).size,
      taskCount: course._count.assignments,
      materialCount: course.materialAssignments.length,
      upcomingCount: course.assignments.length,
    },
  }))
  const studentCourses: NavigationCourse[] = (studentResult.courses ?? []).map((course: any) => ({
    id: course.id,
    name: course.name,
    reportName: course.reportName,
    roleContext: "student",
    subject: course.subject ? { name: course.subject.name, code: course.subject.code } : null,
    class: course.class ? { name: course.class.name, color: course.class.color } : null,
    teacherName: course.teacher?.name,
    iconImageUrl: course.iconImageUrl,
    lastSectionKey: stateByKey.get(`student:${course.id}`),
    summary: {
      taskCount: course._count.assignments,
      materialCount: course.materialAssignments.length,
      upcomingCount: course.assignments.length,
    },
  }))
  const courses = [
    ...orderCourses(teacherCourses, workspacePreference.teachingCourseOrder),
    ...orderCourses(studentCourses, workspacePreference.enrolledCourseOrder),
  ]

  return (
    <ChatNotificationProvider initialConversations={conversations} userId={session.user.id}>
      <MobileHeaderProvider>
        <AppearancePreferenceHydrator density={workspacePreference.density} theme={workspacePreference.theme} />
        <WorkspaceShell
          user={{
            id: session.user.id,
            name: session.user.name,
            nickname: session.user.nickname,
            email: session.user.email,
            image: session.user.image,
            roles,
          }}
          courses={courses}
          channelSidebarCollapsed={workspacePreference.channelSidebarCollapsed}
        >
          {children}
        </WorkspaceShell>
      </MobileHeaderProvider>
    </ChatNotificationProvider>
  )
}
