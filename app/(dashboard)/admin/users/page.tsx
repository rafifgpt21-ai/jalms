import { Suspense } from "react"
import { getUsers } from "@/lib/actions/user.actions"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserToolbar } from "@/components/admin/users/user-toolbar"

import { UserModal } from "@/components/admin/users/user-modal"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspaceActions, WorkspacePage } from "@/components/workspace/workspace-page"

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
        <WorkspacePage>
            <MobileHeaderSetter title="User Management" subtitle="Manage accounts for students, teachers, and admins." />

            <WorkspaceActions className="md:flex-row">
                    <Button asChild variant="outline" className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Link href="/admin/users/import">Import via Excel</Link>
                    </Button>
                    <UserModal />
            </WorkspaceActions>

            {/* Glass Container for Toolbar & Table */}
            <div className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-xs">
                <div className="border-b bg-muted/40 p-3">
                    <UserToolbar />
                </div>

                <div className="flex-1">
                    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading users...</div>}>
                        <DataTable columns={columns} data={users} />
                    </Suspense>
                </div>
            </div>
        </WorkspacePage>
    )
}
