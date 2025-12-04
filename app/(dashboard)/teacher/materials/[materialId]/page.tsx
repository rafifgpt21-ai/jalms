import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getUser } from "@/lib/actions/user.actions"

export default async function MaterialViewPage({ params }: { params: Promise<{ materialId: string }> }) {
    const { materialId } = await params
    const user = await getUser()

    if (!user) return <div>Unauthorized</div>

    const material = await db.material.findUnique({
        where: { id: materialId }
    })

    if (!material) {
        return notFound()
    }

    // Basic authorization check: Teacher must own the material
    if (material.teacherId !== user.id) {
        return <div>Unauthorized</div>
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/teacher/materials">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">{material.title}</h1>
                        {material.description && (
                            <p className="text-sm text-muted-foreground">{material.description}</p>
                        )}
                    </div>
                </div>
                <Button asChild>
                    <a href={material.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </a>
                </Button>
            </div>

            <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                <iframe
                    src={material.fileUrl}
                    className="w-full h-full"
                    title={material.title}
                />
            </div>
        </div>
    )
}
