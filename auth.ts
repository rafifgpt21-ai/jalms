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
                try {
                    console.log("Authorize called with email:", (credentials as any)?.email);
                    const parsedCredentials = z
                        .object({ email: z.string().email(), password: z.string().min(6) })
                        .safeParse(credentials);

                    if (parsedCredentials.success) {
                        const { email, password } = parsedCredentials.data;
                        console.log("Finding user in database...");
                        const user = await db.user.findUnique({ where: { email } });
                        console.log("User found:", !!user);

                        if (!user || !user.password) {
                            console.log("User not found or has no password.");
                            return null;
                        }

                        console.log("Comparing password...");
                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        console.log("Password match:", passwordsMatch);

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
                    } else {
                        console.log("Invalid credentials format");
                    }
                    return null;
                } catch (error) {
                    console.error("Authorize callback error:", error);
                    // Return null instead of throwing to prevent 500 error page
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        ...authConfig.callbacks,
        async jwt({ token }) {
            if (!token.sub) return token;
            const user = await db.user.findUnique({ where: { id: token.sub } });
            if (!user) return token;
            token.roles = user.roles;
            token.avatarConfig = user.avatarConfig;
            token.picture = user.image;
            token.nickname = user.nickname;
            return token;
        }
    }
})
