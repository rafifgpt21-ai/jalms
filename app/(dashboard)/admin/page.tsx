import { getDashboardStats } from "@/lib/actions/dashboard.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, School, BookOpen, Plus, UserPlus, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
    const { stats, recentUsers, error } = await getDashboardStats()

    if (error) {
        return <div className="p-6 text-red-500">Error loading dashboard: {error}</div>
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your school's activity.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/users">
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.students || 0}</div>
                        <p className="text-xs text-muted-foreground">Active students</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.teachers || 0}</div>
                        <p className="text-xs text-muted-foreground">Active teachers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.classes || 0}</div>
                        <p className="text-xs text-muted-foreground">Current classes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.courses || 0}</div>
                        <p className="text-xs text-muted-foreground">In active semester</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Users */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentUsers?.map((user) => (
                                <div key={user.id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.image || ""} alt={user.name} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                                    </div>
                                </div>
                            ))}
                            {(!recentUsers || recentUsers.length === 0) && (
                                <p className="text-sm text-muted-foreground">No recent users found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Link href="/admin/schedule">
                            <Button variant="outline" className="w-full justify-start">
                                <Calendar className="mr-2 h-4 w-4" />
                                Manage Schedules
                            </Button>
                        </Link>
                        <Link href="/admin/classes">
                            <Button variant="outline" className="w-full justify-start">
                                <School className="mr-2 h-4 w-4" />
                                Manage Classes
                            </Button>
                        </Link>
                        <Link href="/admin/courses">
                            <Button variant="outline" className="w-full justify-start">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Manage Courses
                            </Button>
                        </Link>
                        <Link href="/admin/users">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                Manage Users
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
