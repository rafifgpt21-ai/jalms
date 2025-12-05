import { getAllConversations } from "@/app/actions/chat";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSocialsPage() {
    const session = await auth();
    if (!session?.user || !session.user.roles.includes("ADMIN")) {
        redirect("/");
    }

    const conversations = await getAllConversations();

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Socials Monitoring</h1>
            <p className="text-muted-foreground">
                Monitor all conversations within the platform.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {conversations.map((conv: any) => (
                    <Link key={conv.id} href={`/socials/${conv.id}`} target="_blank">
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    Participants
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex -space-x-2 overflow-hidden mb-3">
                                    {conv.participants.map((p: any) => (
                                        <Avatar key={p.id} className="inline-block border-2 border-background w-8 h-8">
                                            <AvatarImage src={p.image || ""} />
                                            <AvatarFallback>{p.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium truncate">
                                        {conv.participants.map((p: any) => p.name).join(", ")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Last active: {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate mt-2 bg-muted p-2 rounded">
                                        Last msg: {conv.messages[0]?.content || "No messages"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {conversations.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                        No conversations found in the system.
                    </div>
                )}
            </div>
        </div>
    );
}
