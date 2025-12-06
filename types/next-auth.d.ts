import { Role } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
    roles: Role[]
    avatarConfig?: any
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        roles?: Role[]
        avatarConfig?: any
    }
}
