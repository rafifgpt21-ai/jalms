"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardContentProps {
    children: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
    const pathname = usePathname()
    // Check if we are in the socials (chat) section
    const isSocials = pathname.startsWith("/socials")

    return (
        <main className={cn(
            "flex-1 bg-gray-50 flex flex-col relative",
            isSocials
                ? "h-full overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 p-0"
                : "p-1.5 md:p-8 overflow-y-auto pb-20 md:pb-8"
        )}>
            {children}
        </main>
    )
}
