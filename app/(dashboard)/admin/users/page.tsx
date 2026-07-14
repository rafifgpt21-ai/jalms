import { Suspense } from "react"
import { getUsers, type UserFilter } from "@/lib/actions/user.actions"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import type { UserColumn } from "./columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserToolbar } from "@/components/admin/users/user-toolbar"

import { UserModal } from "@/components/admin/users/user-modal"
import { MobileHeaderSetter } from "@/components/mobile-header-setter"
import { WorkspaceActions, WorkspacePage } from "@/components/workspace/workspace-page"
import { TablePanelSkeleton } from "@/components/navigation/route-skeletons"

type UsersSearchParams = Promise<{
    query?: string
    page?: string
    role?: string
    status?: string
    sort?: string
    showAll?: string
}>

async function UsersTable({ searchParams }: { searchParams: UsersSearchParams }) {
    const params = await searchParams
    const query = params.query || ""
    const currentPage = Number(params.page) || 1
    const role = (params.role || "ALL") as NonNullable<UserFilter["role"]>
    const status = (params.status || "ALL") as NonNullable<UserFilter["status"]>
    const sort = (params.sort || "newest") as NonNullable<UserFilter["sort"]>
    const showAll = params.showAll === "true"

    const isFiltered = query !== "" || role !== "ALL" || status !== "ALL" || showAll

    let users: UserColumn[] = []

    if (isFiltered) {
        const result = await getUsers({
            page: currentPage,
            limit: 1000,
            search: query,
            role,
            status,
            sort,
        })
        users = result.users
    }

    return (
            <div className="flex min-h-[34rem] flex-col overflow-hidden rounded-lg border bg-card shadow-xs">
                <div className="border-b bg-muted/40 p-3">
                    <UserToolbar />
                </div>

                <div className="flex-1">
                    <DataTable columns={columns} data={users} />
                </div>
            </div>
    )
}

export default function UsersPage({ searchParams }: { searchParams: UsersSearchParams }) {
    return (
        <WorkspacePage>
            <MobileHeaderSetter title="User Management" subtitle="Manage accounts for students, teachers, and admins." />

            <WorkspaceActions className="md:flex-row">
                <Button asChild variant="outline" className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Link href="/admin/users/import" prefetch>Import via Excel</Link>
                </Button>
                <UserModal />
            </WorkspaceActions>

            <Suspense fallback={<TablePanelSkeleton />}>
                <UsersTable searchParams={searchParams} />
            </Suspense>
        </WorkspacePage>
    )
}
