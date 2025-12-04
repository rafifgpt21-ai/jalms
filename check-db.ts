import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    try {
        console.log("--- DEBUG START ---")

        // 7. Check Terms
        console.log("\n--- Checking Terms ---")
        const terms = await prisma.term.findMany()
        terms.forEach(t => {
            console.log(`Term: ${t.academicYearId} - ${t.type}, Active: ${t.isActive}`)
            console.log(`  deletedAt value:`, t.deletedAt)
            console.log(`  deletedAt is null?`, t.deletedAt === null)
            console.log(`  deletedAt is undefined?`, t.deletedAt === undefined)
        })

        const activeTermNull = await prisma.term.findFirst({
            where: { isActive: true, deletedAt: null }
        })
        console.log("Active Term (deletedAt: null):", activeTermNull)

        try {
            const activeTermIsSet = await prisma.term.findFirst({
                where: { isActive: true, deletedAt: { isSet: false } }
            })
            console.log("Active Term (deletedAt: isSet: false):", activeTermIsSet)
        } catch (e) {
            console.log("isSet query failed for Term")
        }

    } catch (error) {
        console.error("Error:", error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
