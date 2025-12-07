
import { getConversations } from "@/app/actions/chat";
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
        <div className="flex h-full w-full overflow-hidden bg-background rounded-lg border shadow-sm">
            <main className="flex-1 flex flex-col min-w-0">
                {children}
            </main>
        </div>
    );
}
