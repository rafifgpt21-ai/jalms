import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMessages } from "@/app/actions/chat";
import { db } from "@/lib/db";
import { AdminChatView } from "@/components/admin/socials/admin-chat-view";

interface AdminChatPageProps {
    params: {
        conversationId: string;
    };
}

export default async function AdminChatPage({ params }: AdminChatPageProps) {
    const session = await auth();
    if (!session?.user || !session.user.roles.includes("ADMIN")) {
        redirect("/");
    }

    const { conversationId } = await params;

    const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true,
                },
            },
        },
    });

    if (!conversation) {
        return <div>Conversation not found</div>;
    }

    const messages = await getMessages(conversationId);

    return (
        <div className="h-full">
            <AdminChatView
                conversationId={conversationId}
                initialMessages={messages}
                participants={conversation.participants}
            />
        </div>
    );
}
