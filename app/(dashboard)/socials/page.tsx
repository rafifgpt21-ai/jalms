import { MessageSquare } from "lucide-react";

export default function SocialsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
            <div className="bg-muted/20 p-4 rounded-full mb-4">
                <MessageSquare className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Select a chat to start messaging</h2>
            <p className="max-w-sm">
                Choose a conversation from the sidebar or start a new one to connect with teachers and students.
            </p>
        </div>
    );
}
