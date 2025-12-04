import { db } from "../lib/db"

async function main() {
    const courseId = "69301990a858e098a444b0d9"
    console.log(`Checking materials for course ${courseId}...`)

    const materials = await db.material.findMany({
        where: {
            courseId: courseId,
        }
    })

    console.log(`Found ${materials.length} materials (total, ignoring deletedAt).`)

    const activeMaterials = await db.material.findMany({
        where: {
            courseId: courseId,
            deletedAt: null
        }
    })

    console.log(`Found ${activeMaterials.length} ACTIVE materials (deletedAt: null).`)

    const activeMaterialsIsSet = await db.material.findMany({
        where: {
            courseId: courseId,
            deletedAt: { isSet: false }
        }
    })
    console.log(`Found ${activeMaterialsIsSet.length} ACTIVE materials (deletedAt: { isSet: false }).`)

    const activeMaterialsEqualsNull = await db.material.findMany({
        where: {
            courseId: courseId,
            deletedAt: { equals: null }
        }
    })
    console.log(`Found ${activeMaterialsEqualsNull.length} ACTIVE materials (deletedAt: { equals: null }).`)

    console.log("ALL MATERIALS:")
    materials.forEach(m => {
        console.log({
            id: m.id,
            title: m.title,
            deletedAt: m.deletedAt,
            uploadedAt: m.uploadedAt
        })
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
