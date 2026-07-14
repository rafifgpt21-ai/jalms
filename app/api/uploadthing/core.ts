import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    courseIcon: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
        .input(z.object({ courseId: z.string() }))
        .middleware(async ({ input }) => {
            const session = await auth();
            if (!session?.user?.id) throw new UploadThingError("Unauthorized");
            const user = await db.user.findUnique({ where: { id: session.user.id }, select: { roles: true } });
            const course = await db.course.findUnique({ where: { id: input.courseId }, select: { teacherId: true } });
            if (!course || (course.teacherId !== session.user.id && !user?.roles.includes("ADMIN"))) {
                throw new UploadThingError("You cannot change this course icon");
            }
            return { userId: session.user.id, courseId: input.courseId };
        })
        .onUploadComplete(async ({ metadata, file }) => ({
            uploadedBy: metadata.userId,
            courseId: metadata.courseId,
            url: file.url,
            key: file.key,
        })),

    // Define as many FileRoutes as you like, each with a unique routeSlug
    courseUpload: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
        pdf: { maxFileSize: "8MB", maxFileCount: 1 },
        text: { maxFileSize: "1MB", maxFileCount: 1 },
        audio: { maxFileSize: "1MB", maxFileCount: 1 },
        blob: { maxFileSize: "16MB", maxFileCount: 1 }
    })
        // Set permissions and file types for this FileRoute
        .middleware(async ({ req }) => {
            console.log("UT Middleware start");
            const start = Date.now();
            // This code runs on your server before upload
            const session = await auth();

            // If you throw, the user will not be able to upload
            if (!session?.user) throw new UploadThingError("Unauthorized");

            console.log("UT Middleware end, took:", Date.now() - start, "ms");
            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadedBy: metadata.userId, url: file.url };
        }),

    // Variant for multiple files if needed later
    courseAttachments: f({
        image: { maxFileSize: "4MB", maxFileCount: 4 },
        pdf: { maxFileSize: "8MB", maxFileCount: 4 },
        text: { maxFileSize: "1MB", maxFileCount: 4 },
        blob: { maxFileSize: "16MB", maxFileCount: 4 }
    })
        .middleware(async ({ req }) => {
            const session = await auth();
            if (!session?.user) throw new UploadThingError("Unauthorized");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId, url: file.url };
        }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
