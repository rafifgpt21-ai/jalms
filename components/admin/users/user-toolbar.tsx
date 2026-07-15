"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, ArrowUpDown, X } from "lucide-react"
import { useState, useEffect } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function UserToolbar() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // State for inputs
    const [search, setSearch] = useState(searchParams.get("query") || "")

    // Sync search state with URL params when they change externally (e.g. back button)
    useEffect(() => {
        setSearch(searchParams.get("query") || "")
    }, [searchParams])

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams)
        if (search) {
            params.set("query", search)
        } else {
            params.delete("query")
        }
        params.set("page", "1")
        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    // Handlers for Filter and Sort
    const handleFilterChange = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== "ALL") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.set("page", "1")
        router.replace(`${pathname}?${params.toString()}`)
    }

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("sort", value)
        router.replace(`${pathname}?${params.toString()}`)
    }

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams)
        params.delete("role")
        params.delete("status")
        params.delete("query")
        params.delete("sort")
        setSearch("")
        router.replace(`${pathname}?${params.toString()}`)
    }

    const currentRole = searchParams.get("role") || "ALL"
    const currentStatus = searchParams.get("status") || "ALL"
    const currentSort = searchParams.get("sort") || "newest"
    const showAll = searchParams.get("showAll") === "true"

    const handleShowAll = () => {
        const params = new URLSearchParams(searchParams)
        if (showAll) {
            params.delete("showAll")
        } else {
            params.set("showAll", "true")
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="admin-toolbar border-0 bg-transparent p-0 shadow-none">
            {/* Search Bar */}
            <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border-input bg-background pl-9 focus:bg-background"
                    />
                </div>
                <Button onClick={handleSearch} size="sm">Search</Button>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                {/* Show All Toggle */}
                {showAll ? (
                    <Button variant="outline" size="sm" onClick={handleShowAll} className="h-9">
                        Hide All Users
                    </Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                                Show All Users
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Show all users?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will load all users in the database. This might take a while depending on the number of users.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleShowAll}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                {/* Filter Button */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-1" aria-label="Filter users">
                            <Filter className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline-block">Filter</span>
                            {(currentRole !== "ALL" || currentStatus !== "ALL") && (
                                <span className="ml-1 rounded-full bg-blue-600 w-2 h-2" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={currentRole} onValueChange={(value) => handleFilterChange("role", value)}>
                            <DropdownMenuRadioItem value="ALL">All roles</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="ADMIN">Admin</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="SUBJECT_TEACHER">Subject Teacher</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="HOMEROOM_TEACHER">Homeroom Teacher</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="STUDENT">Student</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="PARENT">Parent</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={currentStatus} onValueChange={(value) => handleFilterChange("status", value)}>
                            <DropdownMenuRadioItem value="ALL">All statuses</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="ACTIVE">Active</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="INACTIVE">Inactive</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Button */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-1" aria-label="Sort users">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline-block">Sort</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuRadioGroup value={currentSort} onValueChange={handleSortChange}>
                            <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="name_asc">Name (A–Z)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="name_desc">Name (Z–A)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters */}
                {(currentRole !== "ALL" || currentStatus !== "ALL" || search || currentSort !== "newest" || showAll) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-9 px-2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear user filters"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
