
import { db } from "@/lib/db"

async function main() {
    try {
        console.log("Fetching subjects...")
        const subjects = await db.subject.findMany({})
        console.log("Subjects found:", subjects)
    } catch (error) {
        console.error("Error fetching subjects:", error)
    }
}

main()
