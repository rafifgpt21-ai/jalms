"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMessages } from "@/app/actions/chat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Message = {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
        id: string;
        name: string | null;
        image: string | null;
    };
};

type Participant = {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
};

interface AdminChatViewProps {
    conversationId: string;
    initialMessages: Message[];
    participants: Participant[];
}

export function AdminChatView({
    conversationId,
    initialMessages,
    participants,
}: AdminChatViewProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on load and new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Polling for new messages (optional for admin view, but good for real-time monitoring)
    useEffect(() => {
        const interval = setInterval(async () => {
            const latestMessages = await getMessages(conversationId);
            if (latestMessages.length > messages.length) {
                setMessages(latestMessages);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [conversationId, messages.length]);

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-background border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <Button variant="ghost" size="icon" asChild className="mr-2">
                    <Link href="/admin/socials">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex -space-x-2 overflow-hidden">
                    {participants.map((p) => (
                        <Avatar key={p.id} className="inline-block border-2 border-background w-8 h-8">
                            <AvatarImage src={p.image || ""} />
                            <AvatarFallback>{p.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
                <div>
                    <h3 className="font-semibold">
                        {participants.map((p) => p.name).join(", ")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Read-only view
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">
                            No messages in this conversation.
                        </div>
                    ) : (
                        messages.map((message) => {
                            // In admin view, we don't distinguish "me" vs "them" by side, 
                            // or maybe we do? Let's just align left for everyone but show avatar/name clearly.
                            // Actually, standard chat UI usually aligns left for others. 
                            // Since admin is neither, let's align everyone left but group by sender.

                            return (
                                <div
                                    key={message.id}
                                    className="flex w-full justify-start gap-2"
                                >
                                    <Avatar className="w-8 h-8 mt-1">
                                        <AvatarImage src={message.sender.image || ""} />
                                        <AvatarFallback>{message.sender.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col max-w-[70%]">
                                        <span className="text-xs text-muted-foreground ml-1 mb-1">
                                            {message.sender.name}
                                        </span>
                                        <div
                                            className="flex flex-col gap-1 rounded-2xl px-4 py-2 text-sm shadow-sm bg-muted text-foreground rounded-tl-none"
                                        >
                                            <p>{message.content}</p>
                                            <span className="text-[10px] self-end opacity-70">
                                                {format(new Date(message.createdAt), "HH:mm")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>
        </div>
    );
}
