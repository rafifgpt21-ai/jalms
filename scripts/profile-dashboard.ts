
import { getTeacherDashboardStats } from "../lib/actions/teacher.actions"

async function main() {
    console.log("Starting profile...")
    const start = performance.now()
    const result = await getTeacherDashboardStats("69672dd234c708807164eebf")
    const end = performance.now()

    if (result.error) {
        console.error("Error:", result.error)
    } else {
        console.log("Success!")
        // console.log(JSON.stringify(result, null, 2))
    }
    console.log(`Total execution time: ${(end - start).toFixed(2)}ms`)
}

main()
