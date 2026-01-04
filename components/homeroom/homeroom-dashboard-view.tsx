"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users, BookOpen, GraduationCap, ArrowUpRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface HomeroomDashboardViewProps {
    classes: any[]
}

export function HomeroomDashboardView({ classes }: HomeroomDashboardViewProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.length === 0 ? (
                    <motion.div variants={item} className="col-span-full">
                        <div className="p-12 text-center bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <GraduationCap className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Homeroom Classes Assigned</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">You are not currently assigned as a homeroom teacher for any active classes.</p>
                        </div>
                    </motion.div>
                ) : (
                    classes.map((cls) => (
                        <motion.div key={cls.id} variants={item}>
                            <Link href={`/homeroom/${cls.id}`}>
                                <Card className="group relative overflow-hidden border-none shadow-xl bg-white/60 dark:bg-slate-900/40 ring-1 ring-black/5 dark:ring-white/10 hover:ring-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 h-full">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-5 h-5 text-indigo-500" />
                                    </div>

                                    <div className="p-6">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <Users className="w-6 h-6" />
                                        </div>

                                        <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {cls.name}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-4">
                                            <Badge variant="outline" className="bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-mono text-xs">
                                                {cls.term.type} SEMESTER
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Students</p>
                                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                    {cls._count.students}
                                                </p>
                                            </div>
                                            <div>
                                                {/* Placeholder for future stats like attendance avg */}
                                                {/* <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Avg Grade</p>
                                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">-</p> */}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    )
}
