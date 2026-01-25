import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"


export function UpNextSkeleton() {
    return (
        <div className="md:col-span-2 lg:col-span-2 h-full min-h-[220px]">
            <div className="relative overflow-hidden rounded-3xl p-6 h-full flex flex-col justify-between shadow-xl bg-slate-100 dark:bg-slate-800">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function ScheduleSkeleton() {
    return (
        <Card className="md:col-span-2 lg:col-span-2 h-full border-none shadow-xl bg-white/60 dark:bg-slate-900/40 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 z-10">
                <div>
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <div className="flex-1 p-6 relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="relative pl-8">
                            <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800 -translate-x-[5px]" />
                            <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-6 w-3/4 mb-1" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

export function DeadlinesSkeleton() {
    return (
        <Card className="md:col-span-2 lg:col-span-2 border-none shadow-xl bg-white/60 dark:bg-slate-900/40 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 z-10">
                <div>
                    <h3 className="font-bold font-heading text-lg text-slate-800 dark:text-slate-200">Upcoming Deadlines</h3>
                    <p className="text-xs text-slate-500">Tasks needing attention</p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-3 w-16" />
                                        <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

export function GradesSkeleton() {
    return (
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/60 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 rounded-3xl p-6 h-full flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none">
                <div className="mb-4">
                    <Skeleton className="h-12 w-12 rounded-2xl mb-4" />
                    <Skeleton className="h-10 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 rounded-3xl p-6 h-full flex flex-col justify-between shadow-lg shadow-slate-200/50 dark:shadow-none">
                <div className="mb-4">
                    <Skeleton className="h-12 w-12 rounded-2xl mb-4" />
                    <Skeleton className="h-10 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    )
}
