import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getCourseChatAccess } from "@/lib/course-chat"
import { courseIdFromChatChannel } from "@/lib/course-chat.shared"
import { getPusherServer, isPusherConfigured } from "@/lib/pusher/server"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!isPusherConfigured()) return NextResponse.json({ error: "Pusher is not configured" }, { status: 503 })

  const form = await request.formData()
  const socketId = form.get("socket_id")
  const channelName = form.get("channel_name")
  if (typeof socketId !== "string" || typeof channelName !== "string") {
    return NextResponse.json({ error: "Invalid authorization request" }, { status: 400 })
  }

  const courseId = courseIdFromChatChannel(channelName)
  if (!courseId) return NextResponse.json({ error: "Invalid channel" }, { status: 400 })

  const course = await getCourseChatAccess(courseId, session.user.id)
  if (!course) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json(getPusherServer().authorizeChannel(socketId, channelName))
}
