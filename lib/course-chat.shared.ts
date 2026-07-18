export const COURSE_CHAT_PAGE_SIZE = 50
export const COURSE_CHAT_MAX_LENGTH = 2000
export const COURSE_CHAT_CHANNEL_PREFIX = "private-course-chat-"
export const COURSE_CHAT_EVENT = "course-message-created"

export function courseChatChannel(courseId: string) {
  return `${COURSE_CHAT_CHANNEL_PREFIX}${courseId}`
}

export function courseIdFromChatChannel(channelName: string) {
  const match = channelName.match(/^private-course-chat-([a-f\d]{24})$/i)
  return match?.[1] ?? null
}
