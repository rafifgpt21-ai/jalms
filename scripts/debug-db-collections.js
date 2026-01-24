
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        console.log("Querying database for collection names...")

        // MongoDB command to list collections
        const result = await prisma.$runCommandRaw({
            listCollections: 1
        })

        console.log("\n--- CONNECTED DATABASE COLLECTIONS ---")

        if (result.cursor && result.cursor.firstBatch) {
            const collections = result.cursor.firstBatch
            if (collections.length === 0) {
                console.log("No collections found! (This is unexpected if data exists)")
            } else {
                collections.forEach(c => {
                    console.log(`- ${c.name} (type: ${c.type})`)
                })
            }
        } else {
            console.log("Unexpected response format:", JSON.stringify(result, null, 2))
        }

        // Also print a masked version of the datasource URL if possible (requires accessing private props, maybe skip)
        // Instead, let's print the specific counts again to be sure
        const materialCount = await prisma.material.count()
        console.log(`\nVerified 'Material' count via Prisma: ${materialCount}`)

    } catch (e) {
        console.error("Error:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
