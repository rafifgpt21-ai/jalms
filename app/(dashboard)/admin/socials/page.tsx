import { getAllConversations } from "@/app/actions/chat";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SocialsTable } from "@/components/admin/socials/socials-table";

export default async function AdminSocialsPage() {
    const session = await auth();
    if (!session?.user || !session.user.roles.includes("ADMIN")) {
        redirect("/");
    }

    const conversations = await getAllConversations();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Socials Monitoring</h1>
            <p className="text-muted-foreground">
                Monitor all conversations within the platform.
            </p>

            <SocialsTable conversations={conversations} />
        </div>
    );
}
