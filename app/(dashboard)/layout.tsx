import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session) redirect("/login")

    return (
        <div className="flex min-h-screen">
            {/* Sidebar will go here */}
            <aside className="w-64 bg-gray-900 text-white p-4 hidden md:block">
                <h1 className="text-xl font-bold mb-6">JALMS</h1>
                <nav>
                    {/* Dynamic Nav based on Role */}
                    <div className="mb-4">
                        <h2 className="text-xs uppercase text-gray-500 mb-2">Menu</h2>
                        <div className="text-sm text-gray-400">
                            Welcome, {session.user?.name}
                        </div>
                    </div>
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-gray-50">
                {children}
            </main>
        </div>
    )
}
