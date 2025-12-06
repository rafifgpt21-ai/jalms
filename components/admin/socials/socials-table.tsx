"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Eye } from "lucide-react"

interface SocialsTableProps {
    conversations: any[]
}

export function SocialsTable({ conversations }: SocialsTableProps) {
    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Participants</TableHead>
                        <TableHead>Last Message</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {conversations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                No conversations found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        conversations.map((conv) => (
                            <TableRow key={conv.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {conv.participants.map((p: any) => (
                                                <Avatar key={p.id} className="inline-block border-2 border-background w-8 h-8">
                                                    <AvatarImage src={p.image || ""} />
                                                    <AvatarFallback>{p.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                        <span className="text-sm font-medium truncate max-w-[200px]">
                                            {conv.participants.map((p: any) => p.name).join(", ")}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                        {conv.messages[0]?.content || "No messages"}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/admin/socials/${conv.id}`}>
                                            <Eye className="w-4 h-4 mr-2" />
                                            View History
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
