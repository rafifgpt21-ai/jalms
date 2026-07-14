"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { recordManagementChange } from "@/lib/management-audit"

export type RolloverOptions = {
  classes: boolean
  classRosters: boolean
  courses: boolean
  courseMemberships: boolean
  assignmentsAsDrafts: boolean
  announcementsAsDrafts: boolean
  schedules: boolean
  materials: boolean
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { roles: true } })
  return user?.roles.includes("ADMIN") ? session.user.id : null
}

export async function previewAcademicRollover(sourceTermId: string, targetTermId: string) {
  if (!await requireAdmin()) return { error: "Unauthorized" }
  if (!sourceTermId || !targetTermId || sourceTermId === targetTermId) return { error: "Choose two different semesters" }
  const [source, target, sourceClasses, sourceCourses, targetClasses, targetCourses] = await Promise.all([
    db.term.findUnique({ where: { id: sourceTermId }, include: { academicYear: true } }),
    db.term.findUnique({ where: { id: targetTermId }, include: { academicYear: true } }),
    db.class.findMany({ where: { termId: sourceTermId, deletedAt: { isSet: false } }, include: { _count: { select: { students: true } } } }),
    db.course.findMany({ where: { termId: sourceTermId, deletedAt: { isSet: false } }, include: { _count: { select: { assignments: true, announcements: true, materials: true } } } }),
    db.class.findMany({ where: { termId: targetTermId, deletedAt: { isSet: false } }, select: { name: true } }),
    db.course.findMany({ where: { termId: targetTermId, deletedAt: { isSet: false } }, select: { name: true } }),
  ])
  if (!source || !target) return { error: "Semester not found" }
  const targetClassNames = new Set(targetClasses.map(item => item.name.toLowerCase()))
  const targetCourseNames = new Set(targetCourses.map(item => item.name.toLowerCase()))
  return {
    preview: {
      source: `${source.academicYear.name} ${source.type}`,
      target: `${target.academicYear.name} ${target.type}`,
      classes: sourceClasses.length,
      students: sourceClasses.reduce((sum, item) => sum + item._count.students, 0),
      courses: sourceCourses.length,
      assignments: sourceCourses.reduce((sum, item) => sum + item._count.assignments, 0),
      announcements: sourceCourses.reduce((sum, item) => sum + item._count.announcements, 0),
      conflicts: [
        ...sourceClasses.filter(item => targetClassNames.has(item.name.toLowerCase())).map(item => `Class: ${item.name}`),
        ...sourceCourses.filter(item => targetCourseNames.has(item.name.toLowerCase())).map(item => `Course: ${item.name}`),
      ],
    },
  }
}

export async function executeAcademicRollover(sourceTermId: string, targetTermId: string, options: RolloverOptions) {
  const actorId = await requireAdmin()
  if (!actorId) return { error: "Unauthorized" }
  const preview = await previewAcademicRollover(sourceTermId, targetTermId)
  if (!preview.preview) return preview

  const rollover = await db.academicRollover.create({
    data: { sourceTermId, targetTermId, actorId, status: "RUNNING", options, mappings: {} },
  })
  const classMap: Record<string, string> = {}
  const courseMap: Record<string, string> = {}
  const errors: string[] = []

  try {
    const sourceClasses = await db.class.findMany({ where: { termId: sourceTermId, deletedAt: { isSet: false } }, include: { students: { where: { OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] } } } })
    if (options.classes) {
      for (const source of sourceClasses) {
        try {
          const existing = await db.class.findFirst({ where: { termId: targetTermId, name: source.name, deletedAt: { isSet: false } } })
          const target = existing || await db.class.create({ data: { name: source.name, termId: targetTermId, homeroomTeacherId: source.homeroomTeacherId, color: source.color } })
          classMap[source.id] = target.id
          if (options.classRosters) await Promise.all(source.students.map(enrollment => db.enrollment.upsert({
            where: { studentId_classId: { studentId: enrollment.studentId, classId: target.id } },
            create: { studentId: enrollment.studentId, classId: target.id, source: "ROLLOVER", createdById: actorId },
            update: { deletedAt: null, source: "ROLLOVER" },
          })))
        } catch (error) { errors.push(`Class ${source.name}: ${error instanceof Error ? error.message : "failed"}`) }
      }
    }

    const sourceCourses = await db.course.findMany({
      where: { termId: sourceTermId, deletedAt: { isSet: false } },
      include: { assignments: { where: { deletedAt: { isSet: false } } }, announcements: { where: { deletedAt: { isSet: false } } }, materialAssignments: true, schedules: { where: { deletedAt: { isSet: false } } } },
    })
    if (options.courses) {
      for (const source of sourceCourses) {
        try {
          const existing = await db.course.findFirst({ where: { termId: targetTermId, name: source.name, teacherId: source.teacherId, deletedAt: { isSet: false } } })
          const target = existing || await db.course.create({ data: {
            name: source.name, reportName: source.reportName, subjectId: source.subjectId, classId: source.classId ? classMap[source.classId] || null : null,
            termId: targetTermId, teacherId: source.teacherId, attendancePoolScore: source.attendancePoolScore, competencyRules: source.competencyRules,
            iconImageUrl: source.iconImageUrl, iconImageKey: source.iconImageKey, enrollmentMode: source.enrollmentMode || "MANUAL",
          } })
          courseMap[source.id] = target.id
          if (options.assignmentsAsDrafts) await Promise.all(source.assignments.map(item => db.assignment.create({ data: {
            title: item.title, description: item.description, dueDate: item.dueDate, type: item.type, maxPoints: item.maxPoints, isExtraCredit: item.isExtraCredit,
            latePenalty: item.latePenalty, academicDomains: item.academicDomains, courseId: target.id, quizId: item.quizId, showGradeAfterSubmission: item.showGradeAfterSubmission, status: "DRAFT",
          } })))
          if (options.announcementsAsDrafts) await Promise.all(source.announcements.map(item => db.courseAnnouncement.create({ data: {
            courseId: target.id, authorId: item.authorId, title: item.title, body: item.body, isPinned: item.isPinned, status: "DRAFT",
          } })))
          if (options.materials) await Promise.all(source.materialAssignments.map(item => db.materialAssignment.upsert({ where: { materialId_courseId: { materialId: item.materialId, courseId: target.id } }, create: { materialId: item.materialId, courseId: target.id }, update: {} })))
          if (options.schedules) await Promise.all(source.schedules.map(item => db.schedule.create({ data: { courseId: target.id, dayOfWeek: item.dayOfWeek, period: item.period } })))
          if (options.courseMemberships && target.classId) {
            const { enrollClassToCourse } = await import("@/lib/actions/enrollment.actions")
            await enrollClassToCourse(target.id, target.classId)
          }
        } catch (error) { errors.push(`Course ${source.name}: ${error instanceof Error ? error.message : "failed"}`) }
      }
    }

    const status = errors.length ? "PARTIAL" : "COMPLETED"
    const summary = { classesCreated: Object.keys(classMap).length, coursesCreated: Object.keys(courseMap).length, errors }
    await db.academicRollover.update({ where: { id: rollover.id }, data: { status, mappings: { classes: classMap, courses: courseMap }, summary } })
    await recordManagementChange({ entityType: "ROLLOVER", entityId: rollover.id, action: status, after: summary })
    revalidatePath("/admin/rollover")
    revalidatePath("/admin/classes")
    revalidatePath("/admin/courses")
    return { success: true, rolloverId: rollover.id, status, summary }
  } catch (error) {
    await db.academicRollover.update({ where: { id: rollover.id }, data: { status: "FAILED", summary: { errors: [error instanceof Error ? error.message : "Rollover failed"] } } })
    return { error: "Rollover failed. Review the saved run for details." }
  }
}
