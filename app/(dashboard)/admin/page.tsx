import { getDashboardStats } from "@/lib/actions/dashboard.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, School, BookOpen, Plus, UserPlus, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
    const { stats, lastLoggedInUsers, error } = await getDashboardStats()

    if (error) {
        return <div className="p-6 text-red-500">Error loading dashboard: {error}</div>
    }

    return (
        <div className="space-y-8">
            {/* Quick Actions at the Top */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <Link href="/admin/semesters">
                        <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            Manage Semesters
                        </Button>
                    </Link>
                    <Link href="/admin/socials">
                        <Button variant="outline" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Socials Monitoring
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Attendance Pulse */}
            <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-background border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Today's Pulse</CardTitle>
                    <div className="flex items-center space-x-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Live</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Attendance Rate</p>
                            <div className="text-4xl font-bold tracking-tight">
                                {stats?.attendance?.percentage ?? 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Based on {stats?.attendance?.totalRecords ?? 0} sessions recorded today
                            </p>
                        </div>
                        <div className="h-16 w-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                            <div
                                className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent border-l-transparent transform -rotate-45"
                                style={{ transform: `rotate(${(stats?.attendance?.percentage ?? 0) * 3.6 - 45}deg)` }}
                            />
                            <div className="text-lg font-bold text-primary">
                                {stats?.attendance?.presentCount ?? 0}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Last Logged In Users */}
            <Card>
                <CardHeader>
                    <CardTitle>Last Logged In</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {lastLoggedInUsers?.map((user) => (
                            <div key={user.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.image || undefined} alt={user.name} />
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="ml-4">
                                    <div className="flex gap-1 flex-wrap">
                                        {user.roles.map(role => (
                                            <span key={role} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">
                                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), "MMM d, yyyy h:mm a") : "Never"}
                                </div>
                            </div>
                        ))}
                        {(!lastLoggedInUsers || lastLoggedInUsers.length === 0) && (
                            <p className="text-sm text-muted-foreground">No recent logins found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Total Users Count at the Bottom */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">Registered active users</p>
                </CardContent>
            </Card>
        </div >
    )
}
