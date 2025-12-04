import { auth } from "@/auth"
import { db as prisma } from "@/lib/db"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    // Check if user is admin
    if (!session?.user?.roles.includes("ADMIN")) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { users } = await req.json()

        if (!Array.isArray(users) || users.length === 0) {
            return new NextResponse("No users provided", { status: 400 })
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        }

        // Process in parallel
        await Promise.all(users.map(async (user: any) => {
            try {
                // Basic validation
                if (!user.email || !user.name || !user.password) {
                    throw new Error(`Missing fields for ${user.email || 'unknown user'}`)
                }

                const hashedPassword = await bcrypt.hash(String(user.password), 10)

                // Parse roles (comma separated string -> array of enums)
                let roles: Role[] = [Role.STUDENT]
                if (user.roles) {
                    const roleStrings = user.roles.split(',').map((r: string) => r.trim().toUpperCase().replace(' ', '_'))
                    // Filter valid roles
                    const validRoles = roleStrings.filter((r: string) => Object.values(Role).includes(r as Role))
                    if (validRoles.length > 0) roles = validRoles
                }

                await prisma.user.upsert({
                    where: { email: user.email },
                    update: {
                        name: user.name,
                        roles: roles,
                        // We typically don't re-hash/update password on bulk re-import unless specified, 
                        // but for simplicity we will update it to ensure the excel file is the source of truth.
                        password: hashedPassword,
                        officialId: user.officialId ? String(user.officialId) : undefined,
                    },
                    create: {
                        email: user.email,
                        name: user.name,
                        password: hashedPassword,
                        roles: roles,
                        isActive: true,
                        officialId: user.officialId ? String(user.officialId) : undefined,
                        creationSource: "excel_import"
                    }
                })
                results.success++
            } catch (error: any) {
                results.failed++
                results.errors.push(`Failed to import ${user.email}: ${error.message}`)
            }
        }))

        return NextResponse.json(results)

    } catch (error) {
        console.error("Import error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
