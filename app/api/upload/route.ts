import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), "uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            console.error("Error creating upload dir:", e);
        }

        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Return the URL that will be used to access the file
        // We'll create a route handler at /api/files/[...path] to serve these
        const url = `/api/files/${filename}`;

        return NextResponse.json({ url, name: filename });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
