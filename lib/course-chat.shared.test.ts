import assert from "node:assert/strict"
import test from "node:test"
import {
  COURSE_CHAT_EVENT,
  courseChatChannel,
  courseIdFromChatChannel,
} from "./course-chat.shared"

const COURSE_ID = "507f1f77bcf86cd799439011"

test("course chat channels use the private course namespace", () => {
  assert.equal(courseChatChannel(COURSE_ID), `private-course-chat-${COURSE_ID}`)
  assert.equal(COURSE_CHAT_EVENT, "course-message-created")
})

test("course channel parsing accepts only an exact MongoDB ObjectId channel", () => {
  assert.equal(courseIdFromChatChannel(`private-course-chat-${COURSE_ID}`), COURSE_ID)
  assert.equal(courseIdFromChatChannel(`public-course-chat-${COURSE_ID}`), null)
  assert.equal(courseIdFromChatChannel(`private-course-chat-${COURSE_ID}-extra`), null)
  assert.equal(courseIdFromChatChannel("private-course-chat-not-an-object-id"), null)
})
