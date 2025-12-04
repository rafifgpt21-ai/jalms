import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/auth/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            // Protect dashboard routes
            const isProtected = nextUrl.pathname.startsWith('/teacher') ||
                nextUrl.pathname.startsWith('/homeroom') ||
                nextUrl.pathname.startsWith('/admin') ||
                nextUrl.pathname.startsWith('/student') ||
                nextUrl.pathname.startsWith('/parent');

            if (isProtected) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig
