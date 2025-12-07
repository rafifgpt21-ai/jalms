import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await db.user.findUnique({ where: { email } });
                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        try {
                            await db.user.update({
                                where: { id: user.id },
                                data: { lastLoginAt: new Date() }
                            });
                        } catch (error) {
                            console.error("Failed to update last login:", error);
                        }
                        return user;
                    }
                }
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.roles && session.user) {
                session.user.roles = token.roles as Role[];
            }
            if (token.avatarConfig && session.user) {
                session.user.avatarConfig = token.avatarConfig;
            }
            return session;
        },
        async jwt({ token }) {
            if (!token.sub) return token;
            const user = await db.user.findUnique({ where: { id: token.sub } });
            if (!user) return token;
            token.roles = user.roles;
            token.avatarConfig = user.avatarConfig;
            token.picture = user.image;
            return token;
        }
    }
})
