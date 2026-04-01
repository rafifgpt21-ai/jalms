import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ReportCardLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-4 w-24" />
        <span className="text-slate-300">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Action Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border shadow-lg transition-all">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Skeleton className="h-11 w-full md:w-32 rounded-xl" />
          <Skeleton className="h-11 w-full md:w-32 rounded-xl" />
          <Skeleton className="h-11 w-full md:w-40 rounded-xl" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Attendance Cards Skeleton */}
        <Card className="border-none shadow-xl">
          <CardHeader className="border-b pb-4">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Sections Skeleton */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="rounded-2xl shadow-sm h-64">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note Skeleton */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
