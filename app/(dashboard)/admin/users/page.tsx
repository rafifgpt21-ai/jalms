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
            limit: 1000, // Show all users for scrollable list
            search: query,
            role: role as any,
            status: status as any,
            sort: sort as any,
        })
        users = result.users
        metadata = result.metadata
    }

    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center gap-2 w-full justify-end">
                <Button asChild variant="outline" className="flex-1 md:flex-none">
                    <Link href="/admin/users/import">Import via Excel</Link>
                </Button>
                <UserModal />
            </div>

            <UserToolbar />

            <Suspense fallback={<div>Loading...</div>}>
                <DataTable columns={columns} data={users} />
            </Suspense>
        </div>
    )
}
