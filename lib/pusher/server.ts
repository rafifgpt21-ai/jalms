import Pusher from "pusher"

let pusherServer: Pusher | null = null

function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing required Pusher environment variable: ${name}`)
  return value
}

export function isPusherConfigured() {
  return Boolean(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_SECRET &&
    process.env.NEXT_PUBLIC_PUSHER_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  )
}

export function getPusherServer() {
  if (pusherServer) return pusherServer

  pusherServer = new Pusher({
    appId: required("PUSHER_APP_ID", process.env.PUSHER_APP_ID),
    key: required("NEXT_PUBLIC_PUSHER_KEY", process.env.NEXT_PUBLIC_PUSHER_KEY),
    secret: required("PUSHER_SECRET", process.env.PUSHER_SECRET),
    cluster: required("NEXT_PUBLIC_PUSHER_CLUSTER", process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
    useTLS: true,
  })
  return pusherServer
}
