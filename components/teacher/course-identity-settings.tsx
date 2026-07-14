"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { UploadButton } from "@/lib/uploadthing"
import { updateCourseIcon } from "@/lib/actions/course.actions"
import { Button } from "@/components/ui/button"
import { CourseIdentityBadge } from "@/components/course/course-identity-badge"

export function CourseIdentitySettings({ course }: { course: any }) {
  const [imageUrl, setImageUrl] = useState<string | null>(course.iconImageUrl)
  const [pending, startTransition] = useTransition()
  const preview = { ...course, iconImageUrl: imageUrl, roleContext: "teacher" as const }

  function save(url: string | null, key: string | null) {
    startTransition(async () => {
      const result = await updateCourseIcon(course.id, { url, key })
      if (result.error) { toast.error(result.error); return }
      setImageUrl(url)
      toast.success(url ? "Custom course icon saved" : "Default subject badge restored")
    })
  }

  return <div className="flex flex-wrap items-center gap-4">
    <CourseIdentityBadge course={preview} className="size-16 rounded-2xl" />
    <div className="min-w-0 flex-1"><div className="font-medium">Course identity</div><p className="text-sm text-muted-foreground">Default: {course.subject?.code || "course initials"} on {course.class?.name ? `${course.class.name}'s color` : "an automatic color"}. Custom images keep the class-color ring.</p></div>
    <div className="flex items-center gap-2">
      <UploadButton
        endpoint="courseIcon"
        input={{ courseId: course.id }}
        onClientUploadComplete={(files) => {
          const file: any = files?.[0]
          const server = file?.serverData
          const url = server?.url || file?.url
          if (url) save(url, server?.key || file?.key || null)
        }}
        onUploadError={(error) => { toast.error(error.message) }}
        appearance={{ button: "h-8 w-auto bg-primary px-3 text-xs", allowedContent: "hidden" }}
      />
      {imageUrl && <Button variant="outline" size="sm" disabled={pending} onClick={() => save(null, null)}>Use default</Button>}
    </div>
  </div>
}
