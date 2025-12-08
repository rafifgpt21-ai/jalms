import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            if (isOnLogin) {
                return true;
            }

            if (isLoggedIn) {
                return true;
            }

            return false;
        },
    },
    providers: [],
} satisfies NextAuthConfig
