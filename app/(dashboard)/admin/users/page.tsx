import { Suspense } from "react"
import { getUsers } from "@/lib/actions/user.actions"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserToolbar } from "@/components/admin/users/user-toolbar"

import { UserModal } from "@/components/admin/users/user-modal"

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{
        query?: string
        page?: string
        role?: string
        status?: string
        sort?: string
    }>
}) {
    const params = await searchParams
    const query = params.query || ""
    const currentPage = Number(params.page) || 1
    const role = params.role || "ALL"
    const status = params.status || "ALL"
    const sort = params.sort || "newest"

    const { users, metadata } = await getUsers({
        page: currentPage,
        limit: 1000, // Show all users for scrollable list
        search: query,
        role: role as any,
        status: status as any,
        sort: sort as any,
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage students, teachers, and staff accounts.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin/users/import">Import via Excel</Link>
                    </Button>
                    <UserModal />
                </div>
            </div>

            <UserToolbar />

            <Suspense fallback={<div>Loading...</div>}>
                <DataTable columns={columns} data={users} />
            </Suspense>
        </div>
    )
}
