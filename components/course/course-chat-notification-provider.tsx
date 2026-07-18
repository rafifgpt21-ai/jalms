"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { markCourseChatRead } from "@/lib/actions/course-chat.actions"
import { COURSE_CHAT_EVENT, courseChatChannel, type CourseChatRoleContext } from "@/lib/course-chat.shared"
import { getPusherClient } from "@/lib/pusher/client"

type CourseChatNotificationContextValue = {
  unreadCourseIds: ReadonlySet<string>
  clearCourseUnread: (courseId: string, roleContext: CourseChatRoleContext) => void
}

const CourseChatNotificationContext = React.createContext<CourseChatNotificationContextValue>({
  unreadCourseIds: new Set(),
  clearCourseUnread: () => {},
})

function chatContextFromPath(pathname: string) {
  const match = pathname.match(/^\/(teacher|student)\/courses\/([^/]+)\/chat\/?$/)
  return match ? { roleContext: match[1] as CourseChatRoleContext, courseId: match[2] } : null
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
  const activeChatContext = React.useMemo(() => chatContextFromPath(pathname), [pathname])
  const activeChatContextRef = React.useRef(activeChatContext)
  const [unreadCourseIds, setUnreadCourseIds] = React.useState<Set<string>>(() => new Set(initialUnreadCourseIds))
  const courseIdKey = courseIds.join(":")

  React.useEffect(() => {
    activeChatContextRef.current = activeChatContext
  }, [activeChatContext])

  const clearCourseUnread = React.useCallback((courseId: string, roleContext: CourseChatRoleContext) => {
    setUnreadCourseIds((current) => {
      if (!current.has(courseId)) return current
      const next = new Set(current)
      next.delete(courseId)
      return next
    })
    void markCourseChatRead(courseId, roleContext)
  }, [])

  React.useEffect(() => {
    if (activeChatContext) clearCourseUnread(activeChatContext.courseId, activeChatContext.roleContext)
  }, [activeChatContext, clearCourseUnread])

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
        const activeContext = activeChatContextRef.current
        if (activeContext?.courseId === courseId) {
          void markCourseChatRead(courseId, activeContext.roleContext)
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
