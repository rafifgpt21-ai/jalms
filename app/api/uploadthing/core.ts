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
    assignmentSubmission: f({
        pdf: { maxFileSize: "4MB" },
        text: { maxFileSize: "4MB" },
        image: { maxFileSize: "4MB" },
        video: { maxFileSize: "16MB" },
        audio: { maxFileSize: "8MB" },
        blob: { maxFileSize: "8MB" }
    })
        .middleware(() => handleAuth())
        .onUploadComplete(() => { }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
