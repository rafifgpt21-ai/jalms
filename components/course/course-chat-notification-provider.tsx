"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { markCourseChatRead } from "@/lib/actions/course-chat.actions"
import { COURSE_CHAT_EVENT, courseChatChannel } from "@/lib/course-chat.shared"
import { getPusherClient } from "@/lib/pusher/client"

type CourseChatNotificationContextValue = {
  unreadCourseIds: ReadonlySet<string>
  clearCourseUnread: (courseId: string) => void
}

const CourseChatNotificationContext = React.createContext<CourseChatNotificationContextValue>({
  unreadCourseIds: new Set(),
  clearCourseUnread: () => {},
})

function chatCourseIdFromPath(pathname: string) {
  return pathname.match(/^\/(?:teacher|student)\/courses\/([^/]+)\/chat\/?$/)?.[1] ?? null
}

export function CourseChatNotificationProvider({
  children,
  courseIds,
  initialUnreadCourseIds,
  currentUserId,
}: {
  children: React.ReactNode
  courseIds: string[]
  initialUnreadCourseIds: string[]
  currentUserId: string
}) {
  const pathname = usePathname()
  const activeCourseId = chatCourseIdFromPath(pathname)
  const activeCourseIdRef = React.useRef(activeCourseId)
  const [unreadCourseIds, setUnreadCourseIds] = React.useState<Set<string>>(() => new Set(initialUnreadCourseIds))
  const courseIdKey = courseIds.join(":")

  React.useEffect(() => {
    activeCourseIdRef.current = activeCourseId
  }, [activeCourseId])

  const clearCourseUnread = React.useCallback((courseId: string) => {
    setUnreadCourseIds((current) => {
      if (!current.has(courseId)) return current
      const next = new Set(current)
      next.delete(courseId)
      return next
    })
    void markCourseChatRead(courseId)
  }, [])

  React.useEffect(() => {
    if (activeCourseId) clearCourseUnread(activeCourseId)
  }, [activeCourseId, clearCourseUnread])

  React.useEffect(() => {
    if (!courseIds.length) return
    let pusher
    try {
      pusher = getPusherClient()
    } catch {
      return
    }

    const subscriptions = courseIds.map((courseId) => {
      const channelName = courseChatChannel(courseId)
      const channel = pusher.subscribe(channelName)
      const onMessage = (event: { senderId?: string }) => {
        if (event.senderId === currentUserId) return
        if (activeCourseIdRef.current === courseId) {
          void markCourseChatRead(courseId)
          return
        }
        setUnreadCourseIds((current) => {
          if (current.has(courseId)) return current
          const next = new Set(current)
          next.add(courseId)
          return next
        })
      }
      channel.bind(COURSE_CHAT_EVENT, onMessage)
      return { channel, channelName, onMessage }
    })

    return () => {
      for (const subscription of subscriptions) {
        subscription.channel.unbind(COURSE_CHAT_EVENT, subscription.onMessage)
        pusher.unsubscribe(subscription.channelName)
      }
    }
  }, [courseIdKey, currentUserId]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = React.useMemo(() => ({ unreadCourseIds, clearCourseUnread }), [unreadCourseIds, clearCourseUnread])
  return <CourseChatNotificationContext.Provider value={value}>{children}</CourseChatNotificationContext.Provider>
}

export function useCourseChatNotifications() {
  return React.useContext(CourseChatNotificationContext)
}
