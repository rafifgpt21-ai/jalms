import { db } from "../lib/db"

async function main() {
    console.log("Testing DB write...")

    // 1. Get a course
    const course = await db.course.findFirst()
    if (!course) {
        console.error("No courses found. Cannot test material creation.")
        return
    }
    console.log("Found course:", course.id)

    // 2. Create a material
    try {
        const material = await db.material.create({
            data: {
                title: "Test Material from Script",
                description: "This is a test material created by the debug script.",
                fileUrl: "https://example.com/test.pdf",
                courseId: course.id,
                teacherId: course.teacherId,
            }
        })
        console.log("Successfully created material:", material)
    } catch (error) {
        console.error("Failed to create material:", error)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
