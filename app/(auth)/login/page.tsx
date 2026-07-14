"use client"

import { useActionState } from "react"
import { authenticate } from "@/lib/actions/auth.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react"
import { useState } from "react"

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)
    const [showPassword, setShowPassword] = useState(false)

    return (
        <main className="min-h-[100dvh] overflow-hidden bg-[#f5f7fb] text-slate-950 dark:bg-[#080d1d] dark:text-white">
            <div className="mx-auto flex min-h-[100dvh] max-w-[1600px] p-0 sm:p-4 lg:p-6">
                <div className="flex min-h-[100dvh] w-full overflow-hidden rounded-none border border-white/60 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-[#0c1225] sm:min-h-0 sm:rounded-[28px] lg:min-h-[calc(100dvh-3rem)]">
                    <section className="relative hidden w-[47%] overflow-hidden bg-[#111a3a] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
                        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-indigo-500/35 blur-3xl" />
                        <div className="absolute -bottom-48 -left-32 h-[540px] w-[540px] rounded-full bg-cyan-400/20 blur-3xl" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(129,140,248,.2),transparent_28%),linear-gradient(135deg,#172455_0%,#111735_58%,#0a1025_100%)]" />
                        <div className="relative z-10 flex items-center gap-3">
                            <span className="font-heading text-2xl font-semibold tracking-[-0.06em]">Arsync<span className="text-cyan-300">.</span></span>
                            <span className="h-5 w-px bg-white/20" />
                            <span className="text-sm text-slate-300">workspace</span>
                        </div>
                        <div className="relative z-10 max-w-lg">
                            <p className="mb-5 flex items-center gap-2 text-sm font-medium text-cyan-300"><span className="h-px w-8 bg-cyan-300" /> Learn without limits</p>
                            <h1 className="font-heading text-5xl font-semibold leading-[1.06] tracking-[-0.04em] xl:text-6xl">Everything your classroom needs, in one place.</h1>
                            <p className="mt-6 max-w-md text-base leading-7 text-slate-300">A calmer, smarter learning space for students, teachers, and the people who keep it all moving.</p>
                            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                                {['Organize with ease', 'Stay connected', 'Grow together'].map((item) => <span key={item} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-400/15 text-cyan-300"><Check className="h-3 w-3" /></span>{item}</span>)}
                            </div>
                        </div>
                        <p className="relative z-10 text-xs text-slate-400">© 2025 Arsync Inc.</p>
                    </section>

                    <section className="relative flex w-full flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:w-[53%] lg:px-12 xl:px-20">
                        <div className="absolute left-0 top-0 h-48 w-full bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-indigo-950/20" />
                        <div className="relative z-10 w-full max-w-[430px]">
                            <div className="mb-9 font-heading text-3xl font-semibold tracking-[-0.07em] lg:hidden">Arsync<span className="text-indigo-500">.</span></div>
                            <div className="mb-8">
                                <div className="mb-7 hidden font-heading text-4xl font-semibold tracking-[-0.07em] lg:block">Arsync<span className="text-indigo-500">.</span></div>
                                <p className="mb-3 text-sm font-medium text-indigo-600 dark:text-indigo-300">Welcome back</p>
                                <h2 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Sign in to your workspace</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Pick up where you left off and keep your learning moving forward.</p>
                            </div>
                            <form action={dispatch} className="space-y-5">
                                <div className="space-y-2"><Label htmlFor="email" className="text-sm font-medium">Email address</Label><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-11 shadow-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[.04] dark:focus:bg-white/[.07]" /></div></div>
                                <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password" className="text-sm font-medium">Password</Label><Link href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">Forgot password?</Link></div><div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-11 shadow-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[.04] dark:focus:bg-white/[.07]" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                                <div aria-live="polite" aria-atomic="true">{errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{errorMessage}</div>}</div>
                                <Button type="submit" disabled={isPending} className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:translate-y-0">{isPending ? "Signing in…" : <span className="flex items-center justify-center gap-2">Continue to Arsync <ArrowRight className="h-4 w-4" /></span>}</Button>
                            </form>
                            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">Need an account? <Link href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">Contact your admin</Link></p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
