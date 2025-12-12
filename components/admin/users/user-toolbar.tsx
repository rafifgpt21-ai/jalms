"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Search Bar */}
            <div className="flex flex-1 max-w-md items-center space-x-2 min-w-[200px]">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                </div>
                <Button onClick={handleSearch} size="sm">Search</Button>
            </div>

            <div className="flex items-center gap-2">
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
                        <Button variant="outline" size="sm" className="h-9 gap-1">
                            <Filter className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline-block">Filter</span>
                            {(currentRole !== "ALL" || currentStatus !== "ALL") && (
                                <span className="ml-1 rounded-full bg-blue-600 w-2 h-2" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={currentRole === "ALL"}
                            onCheckedChange={() => handleFilterChange("role", "ALL")}
                        >
                            All Roles
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={currentRole === "ADMIN"}
                            onCheckedChange={() => handleFilterChange("role", "ADMIN")}
                        >
                            Admin
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={currentRole === "SUBJECT_TEACHER"}
                            onCheckedChange={() => handleFilterChange("role", "SUBJECT_TEACHER")}
                        >
                            Subject Teacher
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={currentRole === "HOMEROOM_TEACHER"}
                            onCheckedChange={() => handleFilterChange("role", "HOMEROOM_TEACHER")}
                        >
                            Homeroom Teacher
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={currentRole === "STUDENT"}
                            onCheckedChange={() => handleFilterChange("role", "STUDENT")}
                        >
                            Student
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={currentRole === "PARENT"}
                            onCheckedChange={() => handleFilterChange("role", "PARENT")}
                        >
                            Parent
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={currentStatus === "ALL"}
                            onCheckedChange={() => handleFilterChange("status", "ALL")}
                        >
                            All Status
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={currentStatus === "ACTIVE"}
                            onCheckedChange={() => handleFilterChange("status", "ACTIVE")}
                        >
                            Active
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={currentStatus === "INACTIVE"}
                            onCheckedChange={() => handleFilterChange("status", "INACTIVE")}
                        >
                            Inactive
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Button */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-1">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline-block">Sort</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("newest")}>
                            Newest First
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("oldest")}>
                            Oldest First
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("name_asc")}>
                            Name (A-Z)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("name_desc")}>
                            Name (Z-A)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters */}
                {(currentRole !== "ALL" || currentStatus !== "ALL" || search || currentSort !== "newest" || showAll) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-9 px-2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
