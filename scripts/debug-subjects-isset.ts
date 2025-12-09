
import { db } from "@/lib/db"

async function main() {
    try {
        console.log("Fetching subjects with isSet: false...")
        const subjects = await db.subject.findMany({
            where: { deletedAt: { isSet: false } }
        })
        console.log("Subjects found:", subjects)
    } catch (error) {
        console.error("Error fetching subjects:", error)
    }
}

main()
