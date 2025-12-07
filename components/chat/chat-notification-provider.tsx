"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { getConversations } from "@/app/actions/chat"

// Define types locally or import if available. 
// Based on chat-sidebar usage:
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
        readByIds?: string[];
        senderId?: string;
    }[];
    initiatorId?: string;
};

interface ChatNotificationContextType {
    conversations: Conversation[];
    hasUnreadMessages: boolean;
    refreshConversations: () => Promise<void>;
}

const ChatNotificationContext = createContext<ChatNotificationContextType>({
    conversations: [],
    hasUnreadMessages: false,
    refreshConversations: async () => { },
})

interface ChatNotificationProviderProps {
    children: React.ReactNode
    initialConversations: Conversation[]
    userId: string
}

export function ChatNotificationProvider({
    children,
    initialConversations,
    userId
}: ChatNotificationProviderProps) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations)

    const refreshConversations = useCallback(async () => {
        try {
            // Since getConversations is a server action, it uses the session on the server.
            // We don't need to pass userId explicitly to the action if it uses auth().
            const fresh = await getConversations() as Conversation[]
            setConversations(fresh)
        } catch (error) {
            console.error("Failed to refresh conversations", error)
        }
    }, [])

    useEffect(() => {
        // Sync with initial props if they change (e.g. on navigation that triggers server refresh)
        // Check if length or content changed to avoid unnecessary updates if possible, 
        // but for now relying on referential equality check inside setState might be enough 
        // if React optimizes it, but initialConversations is a new array.
        // Let's at least trust the stable refreshConversations to break the loop downstream.
        setConversations(initialConversations)
    }, [initialConversations])

    useEffect(() => {
        // Poll every 5 seconds
        const interval = setInterval(refreshConversations, 5000)
        return () => clearInterval(interval)
    }, [refreshConversations])

    const hasUnreadMessages = conversations?.some(conv => {
        const lastMessage = conv.messages && conv.messages[0];
        // User not in readByIds of last message
        // And ensure we have a last message
        return lastMessage && userId && !lastMessage.readByIds?.includes(userId);
    }) || false;

    // Memoize the context value to prevent consumers from re-rendering just because provider flipped
    const contextValue = useMemo(() => ({
        conversations,
        hasUnreadMessages,
        refreshConversations
    }), [conversations, hasUnreadMessages, refreshConversations]);

    return (
        <ChatNotificationContext.Provider value={contextValue}>
            {children}
        </ChatNotificationContext.Provider>
    )
}


export const useChatNotification = () => useContext(ChatNotificationContext)
