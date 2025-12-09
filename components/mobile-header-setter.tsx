"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobileHeader } from "@/components/mobile-header-context"

interface MobileHeaderSetterProps {
    title: string
    subtitle?: string
    image?: string | null
    backLink?: string
    rightAction?: React.ReactNode
}

export function MobileHeaderSetter({ title, subtitle, image, backLink, rightAction }: MobileHeaderSetterProps) {
    const { setHeader, resetHeader } = useMobileHeader()

    useEffect(() => {
        const leftAction = backLink ? (
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 -ml-2 mr-1 text-gray-500">
                <Link href={backLink}>
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
        ) : null

        setHeader({
            title,
            subtitle,
            image,
            leftAction,
            rightAction
        })
        return () => resetHeader()
    }, [title, subtitle, image, backLink, rightAction, setHeader, resetHeader])

    return null
}
