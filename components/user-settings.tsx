"use client"

import { useState } from "react"
import { LogOut, Settings, User, KeyRound } from "lucide-react"
import { signOut } from "next-auth/react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ChangePasswordDialog } from "@/components/change-password-dialog"

interface UserSettingsProps {
    email?: string | null
    name?: string | null
    side?: "top" | "bottom" | "left" | "right"
    align?: "start" | "center" | "end"
}

export function UserSettings({ email, name, side = "bottom", align = "end" }: UserSettingsProps) {
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Settings className="h-5 w-5 text-gray-500" />
                        <span className="sr-only">User Settings</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side={side} align={align} className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{name || "User"}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
                        <KeyRound className="mr-2 h-4 w-4" />
                        <span>Change Password</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setShowLogoutDialog(true)}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign out confirmation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to sign out of your account? You will be redirected to the login page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                        >
                            Sign Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ChangePasswordDialog
                open={showPasswordDialog}
                onOpenChange={setShowPasswordDialog}
            />
        </>
    )
}
