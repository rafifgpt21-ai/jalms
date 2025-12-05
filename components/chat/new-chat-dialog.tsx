"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { searchUsers, createConversation } from "@/app/actions/chat";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface NewChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
}

type UserResult = {
    id: string;
    name: string;
    image: string | null;
    email: string;
    roles: string[];
};

export function NewChatDialog({ open, onOpenChange, userId }: NewChatDialogProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleSearch = async (value: string) => {
        setQuery(value);
        if (value.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const users = await searchUsers(value);
            setResults(users as UserResult[]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const startChat = async (participantId: string) => {
        setIsCreating(true);
        try {
            const result = await createConversation([participantId]);
            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.success && result.conversationId) {
                onOpenChange(false);
                router.push(`/socials/${result.conversationId}`);
                router.refresh(); // Refresh to show new chat in sidebar
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search people..."
                                className="pl-8"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSearch(query);
                                    }
                                }}
                            />
                        </div>
                        <Button onClick={() => handleSearch(query)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {isLoading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : results.length > 0 ? (
                            results.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer group"
                                    onClick={() => startChat(user.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.image || ""} />
                                            <AvatarFallback>
                                                {user.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        disabled={isCreating}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            startChat(user.id);
                                        }}
                                    >
                                        {isCreating ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            ))
                        ) : query.length >= 2 ? (
                            <p className="text-center text-sm text-muted-foreground py-4">
                                No users found.
                            </p>
                        ) : (
                            <p className="text-center text-sm text-muted-foreground py-4">
                                Type to search for students or teachers.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
