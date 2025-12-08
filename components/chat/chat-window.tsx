"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { getMessages, sendMessage, markConversationAsRead } from "@/app/actions/chat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useChatNotification } from "@/components/chat/chat-notification-provider"

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

    // Poll every 3 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            const latestMessages = await getMessages(conversationId);
            if (latestMessages.length > messages.length) {
                setMessages(latestMessages as Message[]);
                // Also mark as read if new messages came in
                await markConversationAsRead(conversationId);
                refreshConversations(); // Update sidebar badges
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [conversationId, messages.length, refreshConversations]);

    // Mark as read on mount
    useEffect(() => {
        const markRead = async () => {
            await markConversationAsRead(conversationId);
            refreshConversations(); // Update sidebar badges
        };
        markRead();
    }, [conversationId, refreshConversations]);

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
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
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
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-4">
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
                                            : "bg-muted text-foreground rounded-bl-none"
                                    )}
                                >
                                    <p>{message.content}</p>
                                    <span className={cn("text-[10px] self-end opacity-70")}>
                                        {format(new Date(message.createdAt), "HH:mm")}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 rounded-full"
                        disabled={isSending}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-full"
                        disabled={!newMessage.trim() || isSending}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
