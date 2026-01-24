import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsSkeleton() {
    return (
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-none shadow-lg bg-white/60 dark:bg-slate-900/40 ring-1 ring-black/5 dark:ring-white/10">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-9 w-9 rounded-xl" />
                        </div>
                        <div>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export function ClassesSkeleton() {
    return (
        <div className="w-full">
            <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/40 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export function AssignmentsSkeleton() {
    return (
        <Card className="border-none shadow-xl bg-white/60 dark:bg-slate-900/40 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 z-10">
                <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-9 w-[160px] rounded-lg" />
            </div>
            <div className="flex-1 p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Skeleton className="h-5 w-12 rounded" />
                                        <Skeleton className="h-5 w-1/2" />
                                    </div>
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <Skeleton className="h-1.5 flex-1 rounded-full" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}

export function RecentSubmissionsSkeleton() {
    return (
        <div className="lg:col-span-1 space-y-6">
            <Card className="h-full min-h-[500px] border-none shadow-xl bg-white/60 dark:bg-slate-900/40 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 flex flex-col">
                <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-0">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <div className="mb-3">
                                    <Skeleton className="h-3 w-full mb-1" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-7 w-full rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
