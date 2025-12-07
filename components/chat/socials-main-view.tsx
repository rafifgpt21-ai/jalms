"use client";

import { useChatNotification } from "@/components/chat/chat-notification-provider";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { MessageSquare } from "lucide-react";

interface SocialsMainViewProps {
    initialConversations: any[];
    userId: string;
}

export function SocialsMainView({ initialConversations, userId }: SocialsMainViewProps) {
    const { conversations } = useChatNotification();
    const activeConversations = conversations.length > 0 ? conversations : initialConversations;

    return (
        <div className="h-full w-full">
            {/* Mobile View: Chat List */}
            <div className="md:hidden h-full border-r bg-sidebar">
                <ChatSidebar
                    initialConversations={activeConversations}
                    userId={userId}
                    variant="sidebar"
                />
            </div>

            {/* Desktop View: Empty State */}
            <div className="hidden md:flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center bg-background">
                <div className="bg-muted/20 p-4 rounded-full mb-4">
                    <MessageSquare className="w-12 h-12" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Select a chat to start messaging</h2>
                <p className="max-w-sm">
                    Choose a conversation from the sidebar or start a new one to connect with teachers and students.
                </p>
            </div>
        </div>
    );
}
