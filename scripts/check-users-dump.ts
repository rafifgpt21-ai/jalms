
import { db } from "../lib/db"

async function main() {
    console.log("Dumping all users...")
    const users = await db.user.findMany({})
    console.log(JSON.stringify(users, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
