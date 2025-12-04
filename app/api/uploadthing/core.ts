import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

const handleAuth = async () => {
    const session = await auth();
    if (!session?.user) throw new UploadThingError("Unauthorized");
    return { userId: session.user.id };
};

export const ourFileRouter = {
    courseAttachment: f(["pdf"])
        .middleware(() => handleAuth())
        .onUploadComplete(() => { }),
    assignmentSubmission: f(["pdf", "text", "image", "video", "audio", "blob"], { maxFileSize: "2MB" })
        .middleware(() => handleAuth())
        .onUploadComplete(() => { }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
