"use client"

import Pusher from "pusher-js"

let pusherClient: Pusher | null = null

export function getPusherClient() {
  if (pusherClient) return pusherClient

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  if (!key || !cluster) throw new Error("Pusher is not configured")

  pusherClient = new Pusher(key, {
    cluster,
    forceTLS: true,
    channelAuthorization: { endpoint: "/api/pusher/auth", transport: "ajax" },
  })
  return pusherClient
}
