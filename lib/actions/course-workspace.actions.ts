"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getCourseWorkspace(courseId: string, roleContext: "teacher" | "student") {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" as const }

  const course = await db.course.findFirst({
    where: {
      id: courseId,
      deletedAt: { isSet: false },
      ...(roleContext === "teacher" ? { teacherId: session.user.id } : { OR: [{ studentIds: { has: session.user.id } }, { courseEnrollments: { some: { studentId: session.user.id, OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] } } }] }),
    },
    include: {
      teacher: { select: { id: true, name: true, image: true } },
      subject: true,
      class: true,
      term: { include: { academicYear: true } },
      assignments: {
        where: { deletedAt: { isSet: false }, status: { not: "ARCHIVED" } },
        orderBy: { dueDate: "asc" },
        take: 6,
        include: { _count: { select: { submissions: true } } },
      },
      announcements: {
        where: { deletedAt: { isSet: false }, status: "PUBLISHED" },
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        take: 4,
        include: { author: { select: { name: true, image: true } } },
      },
      _count: { select: { students: true, materials: true, assignments: true } },
    },
  })
  if (!course) return { error: "Course not found or access denied" as const }
  return { course }
}

export async function createCourseAnnouncement(courseId: string, input: { title: string; body: string; isPinned?: boolean; publish?: boolean }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  const course = await db.course.findFirst({ where: { id: courseId, teacherId: session.user.id }, select: { id: true } })
  if (!course) return { error: "Only the course teacher can post announcements" }
  const title = input.title.trim()
  const body = input.body.trim()
  if (!title || !body) return { error: "Title and message are required" }

  const announcement = await db.courseAnnouncement.create({
    data: {
      courseId,
      authorId: session.user.id,
      title,
      body,
      isPinned: Boolean(input.isPinned),
      status: input.publish === false ? "DRAFT" : "PUBLISHED",
      publishedAt: input.publish === false ? null : new Date(),
    },
  })
  revalidatePath(`/teacher/courses/${courseId}`)
  revalidatePath(`/teacher/courses/${courseId}/announcements`)
  revalidatePath(`/student/courses/${courseId}/announcements`)
  return { success: true, announcement }
}

export async function getCourseAnnouncements(courseId: string, roleContext: "teacher" | "student") {
  const access = await getCourseWorkspace(courseId, roleContext)
  if (!access.course) return access
  const announcements = await db.courseAnnouncement.findMany({
    where: {
      courseId,
      deletedAt: { isSet: false },
      ...(roleContext === "student" ? { status: "PUBLISHED" } : {}),
    },
    include: { author: { select: { name: true, image: true } } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  })
  return { course: access.course, announcements }
}
