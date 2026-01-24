import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PulseSkeleton() {
    return (
        <div className="md:col-span-8 group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xl">
            <div className="p-8 h-full flex flex-col justify-between relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-2.5 w-2.5 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                </div>

                <div className="mt-8 flex items-end gap-4">
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <Skeleton className="h-12 w-20" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-2 w-full mt-4 rounded-full" />
                        <Skeleton className="h-4 w-48 mt-3" />
                    </div>
                    <Skeleton className="hidden sm:block h-24 w-24 rounded-full rounded-2xl" />
                </div>
            </div>
        </div>
    )
}

export function TotalUsersSkeleton() {
    return (
        <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-800 bg-linear-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-6 w-24 bg-white/20" />
                        <Skeleton className="h-5 w-5 bg-white/20" />
                    </div>
                    <div>
                        <Skeleton className="h-12 w-16 mb-2 bg-white/20" />
                        <Skeleton className="h-4 w-32 bg-white/20" />
                    </div>
                    <Skeleton className="h-8 w-24 mt-4 bg-white/20 rounded-md" />
                </div>
            </div>
        </div>
    )
}

export function RecentLoginSkeleton() {
    return (
        <div className="md:col-span-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                                <Skeleton className="h-5 w-32 mb-1" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        </div>
    )
}
