import { Suspense } from "react"
import { getUsers } from "@/lib/actions/user.actions"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserToolbar } from "@/components/admin/users/user-toolbar"

import { UserModal } from "@/components/admin/users/user-modal"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{
        query?: string
        page?: string
        role?: string
        status?: string
        sort?: string
        showAll?: string
    }>
}) {
    const params = await searchParams
    const query = params.query || ""
    const currentPage = Number(params.page) || 1
    const role = params.role || "ALL"
    const status = params.status || "ALL"
    const sort = params.sort || "newest"
    const showAll = params.showAll === "true"

    const isFiltered = query !== "" || role !== "ALL" || status !== "ALL" || showAll

    let users: any[] = []
    let metadata = {
        total: 0,
        page: currentPage,
        limit: 1000,
        totalPages: 0,
    }

    if (isFiltered) {
        const result = await getUsers({
            page: currentPage,
            limit: 1000,
            search: query,
            role: role as any,
            status: status as any,
            sort: sort as any,
        })
        users = result.users
        metadata = result.metadata
    }

    return (
        <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MobileHeaderSetter title="User Management" />

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="hidden md:block">
                    <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage accounts for students, teachers, and admins.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button asChild variant="outline" className="flex-1 md:flex-none border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Link href="/admin/users/import">Import via Excel</Link>
                    </Button>
                    <UserModal />
                </div>
            </div>

            {/* Glass Container for Toolbar & Table */}
            <div style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                    <UserToolbar />
                </div>

                <div className="flex-1">
                    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading users...</div>}>
                        <DataTable columns={columns} data={users} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
