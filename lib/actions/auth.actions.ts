"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const data = Object.fromEntries(formData.entries())
        console.log("Attempting login with:", data.email)
        await signIn("credentials", { ...data, redirectTo: "/admin" })
    } catch (error) {
        console.error("Login error:", error)
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error
    }
}
