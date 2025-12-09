"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft } from "lucide-react";
import { getMessages, sendMessage, markConversationAsRead } from "@/app/actions/chat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useChatNotification } from "@/components/chat/chat-notification-provider"
import { useMobileHeader } from "@/components/mobile-header-context"
import Link from "next/link";

type Message = {
    id: string;
    content: string;
    createdAt: Date;
    readByIds: string[];
    sender: {
        id: string;
        name: string | null;
        image: string | null;
        nickname?: string | null;
    };
};

type Participant = {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
    nickname?: string | null;
};

interface ChatWindowProps {
    conversationId: string;
    initialMessages: any[]; // Using any[] temporarily if Message type mismatch occurs with Prisma return
    currentUserId: string;
    participants: Participant[];
}

export function ChatWindow({
    conversationId,
    initialMessages,
    currentUserId,
    participants,
}: ChatWindowProps) {
    const router = useRouter();
    const { refreshConversations } = useChatNotification()
    const [messages, setMessages] = useState<Message[]>(initialMessages as Message[]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const otherParticipant = participants.find((p) => p.id !== currentUserId);

    // Scroll to bottom on load and new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Polling and Mark Read effects
    // Polling and Mark Read effects
    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        // Track the latest message timestamp to fetch only deltas
        // Initialize with the last message's time or null
        let lastMessageDate = messages.length > 0
            ? new Date(messages[messages.length - 1].createdAt)
            : undefined;

        const markRead = async () => {
            try {
                await markConversationAsRead(conversationId);
                // Refresh context to update global unread count/indicators
                refreshConversations();
            } catch (error) {
                console.error("Failed to mark conversation as read", error);
            }
        };

        // Mark as read immediately on mount
        markRead();

        // Smart polling function
        const pollMessages = async () => {
            if (!isMounted) return;

            // Determine polling interval based on visibility
            // 3s if active, 15s if background/hidden
            const isPageHidden = document.hidden;
            const interval = isPageHidden ? 15000 : 3000;

            try {
                // Fetch only messages AFTER the last one we have
                const newMessages = await getMessages(conversationId, lastMessageDate);

                if (isMounted && Array.isArray(newMessages) && newMessages.length > 0) {
                    setMessages(prev => {
                        // Avoid duplicates just in case, though Date filter should handle it
                        // Map existing IDs
                        const existingIds = new Set(prev.map(m => m.id));
                        const uniqueNewMessages = (newMessages as unknown as Message[]).filter(m => !existingIds.has(m.id));

                        if (uniqueNewMessages.length === 0) return prev;

                        return [...prev, ...uniqueNewMessages];
                    });

                    // Update cursor
                    const lastMsg = newMessages[newMessages.length - 1] as unknown as Message;
                    lastMessageDate = new Date(lastMsg.createdAt);

                    // Check for unread in new messages to mark as read
                    const hasUnread = (newMessages as unknown as Message[]).some(
                        msg => msg.sender.id !== currentUserId && !msg.readByIds.includes(currentUserId)
                    );

                    if (hasUnread && !isPageHidden) {
                        // Only mark read automatically if user is actually looking at the page
                        markRead();
                    }
                }
            } catch (error) {
                console.error("Failed to poll messages", error);
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(pollMessages, interval);
                }
            }
        };

        // Start polling loop
        timeoutId = setTimeout(pollMessages, 3000);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [conversationId, refreshConversations]); // Removing messages dependency to avoid re-triggering loop logic unnecessarily, using ref or local var for cursor

    // Update Mobile Header
    const { setHeader, resetHeader } = useMobileHeader()
    useEffect(() => {
        setHeader({
            title: otherParticipant?.nickname || otherParticipant?.name || "Unknown User",
            subtitle: otherParticipant?.nickname ? otherParticipant?.name : otherParticipant?.email,
            image: otherParticipant?.image,
            leftAction: (
                <Link href="/socials">
                    <Button variant="ghost" size="icon" className="h-9 w-9 -ml-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
            )
        })
        return () => resetHeader()
    }, [otherParticipant, setHeader, resetHeader])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const result = await sendMessage(conversationId, newMessage);
            if (result.error) {
                toast.error(result.error);
            } else if (result.message) {
                // ... (optimistic update logic)
                const optimisticMessage: Message = {
                    id: result.message.id,
                    content: result.message.content,
                    createdAt: new Date(result.message.createdAt),
                    readByIds: result.message.readByIds,
                    sender: {
                        id: currentUserId,
                        name: "Me",
                        image: null
                    }
                };

                setMessages((prev) => [...prev, optimisticMessage]);
                setNewMessage("");
                refreshConversations(); // Update sidebar with new message preview
            }
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-background relative">
            {/* Header */}
            <div className="hidden md:flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10">
                <Avatar>
                    <AvatarImage src={otherParticipant?.image || undefined} />
                    <AvatarFallback>
                        {(otherParticipant?.nickname || otherParticipant?.name)?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{otherParticipant?.nickname || otherParticipant?.name || "Unknown User"}</h3>
                    <p className="text-xs text-muted-foreground">
                        {otherParticipant?.nickname ? otherParticipant?.name : otherParticipant?.email}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-gray-50/50 dark:bg-zinc-900/50">
                <div className="space-y-4 pb-32 md:pb-4">
                    {messages.map((message) => {
                        const isMe = message.sender.id === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex w-full",
                                    isMe ? "justify-end" : "justify-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex max-w-[70%] flex-col gap-1 rounded-2xl px-4 py-2 text-sm shadow-sm",
                                        isMe
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-white dark:bg-zinc-800 text-foreground rounded-bl-none border border-border/50"
                                    )}
                                >
                                    <p>{message.content}</p>
                                    <span className={cn("text-[10px] self-end opacity-70", isMe ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                        {format(new Date(message.createdAt), "HH:mm")}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area - Redesigned with Fixed Mobile Positioning */}
            <div className="fixed bottom-16 left-0 right-0 z-20 md:static md:bottom-auto md:z-auto p-3 md:p-4 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="w-full rounded-2xl pl-4 pr-12 py-6 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20 shadow-inner resize-none overflow-hidden"
                            disabled={isSending}
                            autoComplete="off"
                        />
                    </div>

                    <Button
                        type="submit"
                        size="icon"
                        className={cn(
                            "rounded-full h-12 w-12 shrink-0 shadow-sm transition-all duration-200",
                            newMessage.trim()
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                        disabled={!newMessage.trim() || isSending}
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
