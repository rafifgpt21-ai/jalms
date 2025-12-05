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
    }[];
    messages: {
        content: string;
        createdAt: Date;
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
        return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className={cn("flex flex-col h-full", isSidebar && "text-white")}>
            <div className={cn("p-4 space-y-4", !isSidebar && "border-b", isCollapsed && "items-center px-2")}>
                {!isCollapsed && (
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Chats</h2>
                    </div>
                )}

                {isCollapsed ? (
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-md hover:bg-gray-800 text-white"
                                    onClick={() => setIsNewChatOpen(true)}
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">New Chat</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <Button
                        className={cn(
                            "w-full justify-start gap-2",
                            isSidebar ? "bg-gray-800 hover:bg-gray-700 text-white" : ""
                        )}
                        onClick={() => setIsNewChatOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </Button>
                )}

                {isCollapsed ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-md hover:bg-gray-800 text-white"
                            >
                                <Search className="w-5 h-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="right" className="w-80 p-0 bg-gray-900 border-gray-800">
                            <div className="p-4 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search chats..."
                                        className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
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
                                                            "flex items-center gap-3 p-3 transition-colors hover:bg-gray-800 rounded-md",
                                                            isActive && "bg-gray-800"
                                                        )}
                                                    >
                                                        <Avatar>
                                                            <AvatarImage src={otherParticipant?.image || ""} />
                                                            <AvatarFallback>
                                                                {otherParticipant?.name?.slice(0, 2).toUpperCase() || "??"}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0 text-white">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-medium truncate">
                                                                    {otherParticipant?.name || "Unknown User"}
                                                                </span>
                                                                {lastMessage && (
                                                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                                                            addSuffix: false,
                                                                        })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm truncate text-gray-400">
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
                ) : (
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search chats..."
                            className={cn(
                                "pl-8",
                                isSidebar ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400" : "bg-muted/50"
                            )}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {isCollapsed ? (
                    <div className="flex flex-col gap-2 p-2 items-center">
                        {filteredConversations.map((conv) => {
                            const otherParticipant = conv.participants.find((p) => p.id !== userId);
                            const isActive = pathname === `/socials/${conv.id}`;

                            return (
                                <TooltipProvider key={conv.id}>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={`/socials/${conv.id}`}
                                                className={cn(
                                                    "flex items-center justify-center p-2 rounded-md transition-colors",
                                                    "hover:bg-gray-800",
                                                    isActive && "bg-gray-800"
                                                )}
                                            >
                                                <Avatar>
                                                    <AvatarImage src={otherParticipant?.image || ""} />
                                                    <AvatarFallback>
                                                        {otherParticipant?.name?.slice(0, 2).toUpperCase() || "??"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            {otherParticipant?.name || "Unknown User"}
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

                                return (
                                    <Link
                                        key={conv.id}
                                        href={`/socials/${conv.id}`}
                                        className={cn(
                                            "flex items-center gap-3 p-3 transition-colors last:border-0",
                                            isSidebar
                                                ? "hover:bg-gray-800 border-gray-800"
                                                : "hover:bg-muted/50 border-b border-border/40",
                                            isActive && (isSidebar ? "bg-gray-800" : "bg-muted")
                                        )}
                                    >
                                        <Avatar>
                                            <AvatarImage src={otherParticipant?.image || ""} />
                                            <AvatarFallback>
                                                {otherParticipant?.name?.slice(0, 2).toUpperCase() || "??"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium truncate">
                                                    {otherParticipant?.name || "Unknown User"}
                                                </span>
                                                {lastMessage && (
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                                            addSuffix: false,
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={cn("text-sm truncate", isSidebar ? "text-gray-400" : "text-muted-foreground")}>
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
