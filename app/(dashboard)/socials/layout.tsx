
import { getConversations } from "@/app/actions/chat";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SocialsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const conversations = await getConversations();

    return (
        <div className="flex h-full w-full overflow-hidden rounded-2xl border border-white/20 shadow-xl relative bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[100px]" />
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-80 border-r border-white/20 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl">
                <ChatSidebar
                    initialConversations={conversations}
                    userId={session.user.id!}
                    variant="sidebar"
                    headerMode="show"
                />
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm">
                {children}
            </main>
        </div>
    );
}
