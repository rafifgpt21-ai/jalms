"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NewChatDialog } from "./new-chat-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Conversation = {
    id: string;
    lastMessageAt: Date;
    participants: {
        id: string;
        name: string | null;
        image: string | null;
        email: string | null;
        nickname?: string | null;
    }[];
    messages: {
        content: string;
        createdAt: Date;
        readByIds?: string[];
    }[];
};

interface ChatSidebarProps {
    initialConversations: Conversation[];
    userId: string;
    variant?: "default" | "sidebar";
    isCollapsed?: boolean;
}

export function ChatSidebar({ initialConversations, userId, variant = "default", isCollapsed = false }: ChatSidebarProps) {
    const pathname = usePathname();
    const [conversations, setConversations] = useState(initialConversations);
    const [searchQuery, setSearchQuery] = useState("");
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);

    // Sync state with props when router.refresh() updates initialConversations
    useEffect(() => {
        setConversations(initialConversations);
    }, [initialConversations]);

    const isSidebar = variant === "sidebar";

    const filteredConversations = conversations.filter((conv) => {
        const otherParticipant = conv.participants.find((p) => p.id !== userId);
        const displayName = otherParticipant?.nickname || otherParticipant?.name || "";
        return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className={cn("flex flex-col h-full", isSidebar && "text-sidebar-foreground")}>
            <div className={cn("p-4 flex items-center justify-end gap-2", !isSidebar && "border-b", isCollapsed && "flex-col space-y-4 px-2")}>
                {isCollapsed ? (
                    <>
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
                                        onClick={() => setIsNewChatOpen(true)}
                                    >
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">New Chat</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
                                >
                                    <Search className="w-5 h-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="right" className="w-80 p-0 bg-sidebar border-sidebar-border">
                                <div className="p-4 space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search chats..."
                                            className="pl-8 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {filteredConversations.length === 0 ? (
                                            <div className="p-4 text-center text-muted-foreground text-sm">
                                                No conversations found.
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                {filteredConversations.map((conv) => {
                                                    const otherParticipant = conv.participants.find((p) => p.id !== userId);
                                                    const lastMessage = conv.messages[0];
                                                    const isActive = pathname === `/socials/${conv.id}`;

                                                    return (
                                                        <Link
                                                            key={conv.id}
                                                            href={`/socials/${conv.id}`}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 transition-colors hover:bg-sidebar-accent rounded-md",
                                                                isActive && "bg-sidebar-accent"
                                                            )}
                                                        >
                                                            <Avatar>
                                                                <AvatarImage src={otherParticipant?.image || undefined} />
                                                                <AvatarFallback>
                                                                    {(otherParticipant?.nickname || otherParticipant?.name)?.slice(0, 2).toUpperCase() || "??"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0 text-sidebar-foreground">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-medium truncate">
                                                                        {otherParticipant?.nickname || otherParticipant?.name || "Unknown User"}
                                                                    </span>
                                                                    {lastMessage && (
                                                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                                            {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                                                                addSuffix: false,
                                                                            })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm truncate text-muted-foreground">
                                                                    {lastMessage ? lastMessage.content : "No messages yet"}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </>
                ) : (
                    <>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
                                >
                                    <Search className="w-5 h-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="bottom" align="end" className="w-80 p-0 bg-sidebar border-sidebar-border">
                                <div className="p-4 space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search chats..."
                                            className="pl-8 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {filteredConversations.length === 0 ? (
                                            <div className="p-4 text-center text-muted-foreground text-sm">
                                                No conversations found.
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                {filteredConversations.map((conv) => {
                                                    const otherParticipant = conv.participants.find((p) => p.id !== userId);
                                                    const lastMessage = conv.messages[0];
                                                    const isActive = pathname === `/socials/${conv.id}`;

                                                    return (
                                                        <Link
                                                            key={conv.id}
                                                            href={`/socials/${conv.id}`}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 transition-colors hover:bg-sidebar-accent rounded-md",
                                                                isActive && "bg-sidebar-accent"
                                                            )}
                                                        >
                                                            <Avatar>
                                                                <AvatarImage src={otherParticipant?.image || undefined} />
                                                                <AvatarFallback>
                                                                    {(otherParticipant?.nickname || otherParticipant?.name)?.slice(0, 2).toUpperCase() || "??"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0 text-sidebar-foreground">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="font-medium truncate">
                                                                        {otherParticipant?.nickname || otherParticipant?.name || "Unknown User"}
                                                                    </span>
                                                                    {lastMessage && (
                                                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                                            {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                                                                addSuffix: false,
                                                                            })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm truncate text-muted-foreground">
                                                                    {lastMessage ? lastMessage.content : "No messages yet"}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
                            onClick={() => setIsNewChatOpen(true)}
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {isCollapsed ? (
                    <div className="flex flex-col gap-2 p-2 items-center">
                        {filteredConversations.map((conv) => {
                            const otherParticipant = conv.participants.find((p) => p.id !== userId);
                            const isActive = pathname === `/socials/${conv.id}`;
                            const lastMessage = conv.messages[0];
                            // Check if unread: has last message, and user ID is NOT in readByIds
                            const isUnread = lastMessage && !lastMessage.readByIds?.includes(userId);

                            return (
                                <TooltipProvider key={conv.id}>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={`/socials/${conv.id}`}
                                                className={cn(
                                                    "flex items-center justify-center p-2 rounded-md transition-colors relative",
                                                    "hover:bg-sidebar-accent",
                                                    isActive && "bg-sidebar-accent"
                                                )}
                                            >
                                                <Avatar>
                                                    <AvatarImage src={otherParticipant?.image || undefined} />
                                                    <AvatarFallback>
                                                        {(otherParticipant?.nickname || otherParticipant?.name)?.slice(0, 2).toUpperCase() || "??"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {isUnread && (
                                                    <div className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                                                )}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            {otherParticipant?.nickname || otherParticipant?.name || "Unknown User"}
                                            {isUnread && " (Unread)"}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                ) : (
                    filteredConversations.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            No conversations found.
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredConversations.map((conv) => {
                                const otherParticipant = conv.participants.find((p) => p.id !== userId);
                                const lastMessage = conv.messages[0];
                                const isActive = pathname === `/socials/${conv.id}`;
                                // Check if unread: has last message, and user ID is NOT in readByIds
                                const isUnread = lastMessage && !lastMessage.readByIds?.includes(userId);

                                return (
                                    <Link
                                        key={conv.id}
                                        href={`/socials/${conv.id}`}
                                        className={cn(
                                            "flex items-center gap-3 p-3 transition-colors last:border-0 relative",
                                            isSidebar
                                                ? "hover:bg-sidebar-accent border-sidebar-border"
                                                : "hover:bg-muted/50 border-b border-border/40",
                                            isActive && (isSidebar
                                                ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-400"
                                                : "bg-muted"
                                            )
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarImage src={otherParticipant?.image || undefined} />
                                                <AvatarFallback>
                                                    {(otherParticipant?.nickname || otherParticipant?.name)?.slice(0, 2).toUpperCase() || "??"}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isUnread && (
                                                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-background" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={cn("font-medium truncate", isUnread && "font-bold text-foreground")}>
                                                    {otherParticipant?.nickname || otherParticipant?.name || "Unknown User"}
                                                </span>
                                                {lastMessage && (
                                                    <span className={cn("text-xs whitespace-nowrap ml-2", isUnread ? "text-red-500 font-medium" : "text-muted-foreground")}>
                                                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                                            addSuffix: false,
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={cn("text-sm truncate", isUnread ? "text-foreground font-medium" : "text-muted-foreground")}>
                                                {lastMessage ? lastMessage.content : "No messages yet"}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )
                )}
            </div>

            <NewChatDialog
                open={isNewChatOpen}
                onOpenChange={setIsNewChatOpen}
                userId={userId}
            />
        </div>
    );
}
