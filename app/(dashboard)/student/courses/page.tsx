import { getStudentCourses } from "@/lib/actions/student.actions"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react"

export const dynamic = 'force-dynamic'

const gradients = [
    "from-rose-500 to-orange-500",
    "from-violet-600 to-indigo-600",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-fuchsia-500 to-pink-500",
    "from-amber-500 to-orange-600"
]

function getGradient(id: string) {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % gradients.length
    return gradients[index]
}

export default async function StudentCoursesPage() {
    const { courses, error } = await getStudentCourses()

    if (error || !courses) {
        return <div className="p-10 text-center text-red-500">Error loading courses</div>
    }

    return (
        <div className="space-y-6">
            <MobileHeaderSetter title="My Courses" />

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">my courses</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your learning journey</p>
                </div>
                {/* Could add a filter/search here later */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length > 0 ? courses.map((course: any) => {
                    const gradient = getGradient(course.id)

                    return (
                        <Link href={`/student/courses/${course.id}`} key={course.id} className="group block h-full">
                            <div className="relative h-full overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10">
                                {/* Cover Image area */}
                                <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                                            {course.term.name}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-5 space-y-4">
                                    <div>
                                        <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {course.reportName || course.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400 text-sm">
                                            <GraduationCap className="w-4 h-4" />
                                            <span>{course.teacher.name}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            {course._count.assignments} Tasks
                                        </div>

                                        <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-full transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                        </Link>
                    )
                }) : (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        You are not enrolled in any courses yet.
                    </div>
                )}
            </div>
        </div>
    )
}
