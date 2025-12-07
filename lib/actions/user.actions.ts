"use server"

import { db as prisma } from "@/lib/db"
import { Role, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"

export async function getUser() {
    const session = await auth()
    return session?.user
}

export type UserFilter = {
    page?: number
    limit?: number
    search?: string
    role?: Role | "ALL"
    status?: "ACTIVE" | "ARCHIVED" | "ALL"
    sort?: "newest" | "oldest" | "name_asc" | "name_desc"
}

export async function getUsers({
    page = 1,
    limit = 10,
    search = "",
    role = "ALL",
    status = "ALL",
    sort = "newest",
}: UserFilter) {
    const skip = (page - 1) * limit

    const where: Prisma.UserWhereInput = {
        AND: [
            search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {},
            role !== "ALL" ? { roles: { has: role } } : {},
            status !== "ALL"
                ? { isActive: status === "ACTIVE" }
                : {},
            { deletedAt: null }, // Only show non-deleted users
        ],
    }

    let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" }

    switch (sort) {
        case "oldest":
            orderBy = { createdAt: "asc" }
            break
        case "name_asc":
            orderBy = { name: "asc" }
            break
        case "name_desc":
            orderBy = { name: "desc" }
            break
        case "newest":
        default:
            orderBy = { createdAt: "desc" }
            break
    }

    try {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    roles: true,
                    isActive: true,
                    image: true,
                    createdAt: true,
                    officialId: true,
                },
            }),
            prisma.user.count({ where }),
        ])

        return {
            users,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Error fetching users:", error)
        throw new Error("Failed to fetch users")
    }
}

export async function createUser(data: any) {
    // Basic validation
    if (!data.email || !data.name || !data.password) {
        return { error: "Missing required fields" }
    }

    try {
        const hashedPassword = await bcrypt.hash(data.password, 10)

        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                roles: data.roles || [Role.STUDENT],
            }
        })

        revalidatePath("/admin/users")
        return { success: true, user, error: undefined }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, user: null, error: "Email or ID already exists" }
        }
        console.error("Error creating user:", error)
        return { success: false, user: null, error: "Failed to create user" }
    }
}

export async function updateUser(id: string, data: any) {
    try {
        const updateData: any = {
            name: data.name,
            email: data.email,
            roles: data.roles,
            officialId: data.officialId,
            isActive: data.isActive,
            avatarConfig: data.avatarConfig,
        }

        // Only hash and update password if provided
        if (data.password && data.password.trim() !== "") {
            updateData.password = await bcrypt.hash(data.password, 10)
        }

        await prisma.user.update({
            where: { id },
            data: updateData,
        })

        revalidatePath("/admin/users")
        revalidatePath("/admin/users")
        return { success: true, error: undefined }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: "Email or ID already exists" }
        }
        console.error("Error updating user:", error)
        return { success: false, error: "Failed to update user" }
    }
}

export async function deleteUser(id: string) {
    try {
        const timestamp = new Date().getTime()
        // Soft delete: update email to free it up, set active to false, set deletedAt
        // We fetch the user first to get their email if we want to be safe, but we can just use the ID update
        // Actually, we need to append to the current email to avoid collisions and free up the original email.

        const user = await prisma.user.findUnique({ where: { id }, select: { email: true } })
        if (!user) return { error: "User not found" }

        await prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
                email: `deleted_${timestamp}_${user.email}`, // Scramble email to release unique constraint
            }
        })
        revalidatePath("/admin/users")
        revalidatePath("/admin/users")
        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error deleting user:", error)
        return { success: false, error: "Failed to delete user" }
    }
}

export async function toggleUserStatus(id: string, isActive: boolean) {
    try {
        await prisma.user.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath("/admin/users")
        return { success: true, error: undefined }
    } catch (error) {
        return { success: false, error: "Failed to update status" }
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: "Unauthorized" }
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user || !user.password) {
            return { error: "User not found" }
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

        if (!isPasswordValid) {
            return { error: "Invalid current password" }
        }

        if (newPassword.length < 8) {
            return { error: "Password must be at least 8 characters" }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        })

        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error changing password:", error)
        return { success: false, error: "Failed to change password" }
    }
}

export async function updateUserAvatar(avatarConfig: any, imageUrl: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: "Unauthorized" }
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                avatarConfig,
                image: imageUrl
            }
        })

        revalidatePath("/admin/users")
        revalidatePath("/admin/users")
        return { success: true, error: undefined }
    } catch (error) {
        console.error("Error updating avatar:", error)
        return { success: false, error: "Failed to update avatar" }
    }
}
