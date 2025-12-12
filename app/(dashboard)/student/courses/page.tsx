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
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-red-900 dark:text-red-200">Failed to load courses</h3>
                <p className="text-red-600 dark:text-red-400 max-w-sm mt-2">
                    We couldn't fetch your learning dashboard at the moment. Please try again later.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MobileHeaderSetter title="My Courses" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
                        My Learning
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
                        Continue your journey across <span className="font-semibold text-indigo-600 dark:text-indigo-400">{courses.length}</span> active courses.
                    </p>
                </div>
            </div>

            {/* Course Grid - Poster Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.length > 0 ? courses.map((course: any) => {
                    const gradient = getGradient(course.id)
                    // Mock progress for now until backend supports it fully
                    const progress = Math.floor(Math.random() * (100 - 20) + 20)

                    return (
                        <Link href={`/student/courses/${course.id}`} key={course.id} className="group block h-full">
                            <div className="relative h-full flex flex-col overflow-hidden rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">

                                {/* Poster Image Area - Taller aspect ratio */}
                                <div className={`aspect-4/3 bg-linear-to-br ${gradient} relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20 mix-blend-overlay" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />

                                    {/* Glass Badge */}
                                    <div className="absolute top-4 left-4">
                                        <Badge variant="secondary" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1 font-medium shadow-sm">
                                            {course.term.name}
                                        </Badge>
                                    </div>

                                    {/* Icon Container */}
                                    <div className="absolute -bottom-6 right-6 w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500 z-10">
                                        <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 pt-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {course.reportName || course.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                            <GraduationCap className="w-4 h-4" />
                                            <span>{course.teacher.name}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-linear-to-r ${gradient} opacity-80`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                                                {course._count.assignments} Active Tasks
                                            </span>
                                            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
                                                Open <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                }) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            You haven't been enrolled in any courses yet. Check back later or contact your administrator.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
