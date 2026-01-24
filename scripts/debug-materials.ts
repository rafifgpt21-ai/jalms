
import { db } from "@/lib/db"
import { getTeacherMaterials } from "@/lib/actions/material.actions"
import { getUser } from "@/lib/actions/user.actions"

async function debug() {
    console.log("--- DEBUG START ---")
    const user = await getUser()
    console.log("Current User:", user ? `${user.id} (${user.email})` : "None")

    if (user) {
        const result = await getTeacherMaterials()
        console.log("getTeacherMaterials result count:", result.materials?.length)
        if (result.error) console.log("getTeacherMaterials error:", result.error)
    }

    const allMaterials = await db.material.findMany({
        take: 5,
        select: { id: true, title: true, teacherId: true, deletedAt: true }
    })
    console.log("All Materials (First 5):")
    console.dir(allMaterials, { depth: null })

    if (user && allMaterials.length > 0) {
        const matches = allMaterials.filter(m => m.teacherId === user.id)
        console.log(`Materials matching current user (${user.id}):`, matches.length)
    }
    console.log("--- DEBUG END ---")
}

debug()
