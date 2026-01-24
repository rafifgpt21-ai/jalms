"use client"

import { useActionState } from "react"
import { authenticate } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArsyncLogo } from "@/components/ArsyncLogo"
import Link from "next/link"
import { ArrowRight, Lock, Mail } from "lucide-react"

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            {/* Left: Decorative (Desktop Only) */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 relative overflow-hidden p-12 text-white">
                {/* Abstract Background */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-violet-600 to-indigo-900 opacity-90" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                {/* Content */}
                {/* Content */}
                <div className="relative z-10">
                    {/* Logo moved to right side */}
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="text-4xl font-heading font-bold mb-6 leading-tight">
                        Experience the Future of Learning Management
                    </h2>
                    <p className="text-indigo-100 text-lg">
                        Arsync provides a seamless, distraction-free environment for students and teachers to connect, learn, and grow.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-indigo-200">
                    &copy; 2025 Arsync Inc.
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950 relative">
                {/* Mobile Background Touch */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-50/50 via-white to-cyan-50/50 dark:from-slate-950 dark:to-indigo-950 lg:hidden pointer-events-none" />

                <div className="w-full max-w-[400px] space-y-8 relative z-10">
                    <div className="text-center lg:text-left">
                        <div className="flex justify-center mb-8">
                            <img src="https://jjuy48ud0l.ufs.sh/f/h9KMQVU48dknaGxcHu5OjXlCnvKP0dqtwHxcyTzZfMG8g6u4" alt="Arsync Logo" className="h-24 w-auto" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Enter your credentials to access your workspace.
                        </p>
                    </div>

                    <form action={dispatch} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div aria-live="polite" aria-atomic="true">
                            {errorMessage && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 block" />
                                    {errorMessage}
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30 hover:-translate-y-0.5"
                            disabled={isPending}
                        >
                            {isPending ? "Signing in..." : (
                                <span className="flex items-center gap-2">
                                    Sign In <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500">
                        Don&apos;t have an account?{" "}
                        <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Contact Admin
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
