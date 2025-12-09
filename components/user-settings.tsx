"use client"

import { useState } from "react"
import { LogOut, Settings, User, KeyRound, Pencil } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { NicknameDialog } from "@/components/user/nickname-dialog"

interface UserSettingsProps {
    email?: string | null
    name?: string | null
    nickname?: string | null
    image?: string | null
    side?: "top" | "bottom" | "left" | "right"
    align?: "start" | "center" | "end"
    triggerVariant?: "icon" | "card"
}

export function UserSettings({ email, name, nickname, image, side = "bottom", align = "end", triggerVariant = "icon" }: UserSettingsProps) {
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)
    const [showAvatarDialog, setShowAvatarDialog] = useState(false)
    const [showNicknameDialog, setShowNicknameDialog] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {triggerVariant === "card" ? (
                        <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors text-left outline-none">
                            <Avatar className="h-10 w-10 border border-gray-200">
                                <AvatarImage src={image || undefined} alt={name || "User"} />
                                <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                                    {name?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-semibold text-gray-900 truncate">
                                    {nickname || name || "User"}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                    {email}
                                </span>
                            </div>
                        </button>
                    ) : (
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0" suppressHydrationWarning>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={image || undefined} alt={name || "User"} />
                                <AvatarFallback>
                                    <Settings className="h-4 w-4 text-gray-500" />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent side={side} align={align} className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={image || undefined} alt={name || "User"} />
                                <AvatarFallback>{name?.[0] || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{name || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {email}
                                </p>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowAvatarDialog(true)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Customize Avatar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowNicknameDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit Nickname</span>
                    </DropdownMenuItem>
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
                            onClick={async () => {
                                await signOut({ redirect: false })
                                window.location.href = "/login"
                            }}
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

            <NicknameDialog
                open={showNicknameDialog}
                onOpenChange={setShowNicknameDialog}
                currentNickname={nickname}
            />

            <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Customize Avatar</DialogTitle>
                        <DialogDescription>
                            Create your unique avatar.
                        </DialogDescription>
                    </DialogHeader>
                    <AvatarEditor onSaved={() => setShowAvatarDialog(false)} />
                </DialogContent>
            </Dialog>
        </>
    )
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AvatarEditor } from "@/components/user/avatar-editor"
