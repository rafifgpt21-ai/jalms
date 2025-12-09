import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import mime from "mime";
import { existsSync } from "fs";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    // Await params as per Next.js 15+ requirements if applicable, but safe for 14 too
    const resolvedParams = await params;

    if (!resolvedParams.path || resolvedParams.path.length === 0) {
        return new NextResponse("File not found", { status: 404 });
    }

    // The filename might be the last segment or the whole path joined
    // For safety, we'll join segments but ensure no traversal
    const filename = resolvedParams.path.join("/");

    // Basic directory traversal protection
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        // A more robust check might be needed if we supported folders, but our upload explicitly 
        // generated flat filenames. Let's strictly block path separators if we expect flat files.
        // However, the above join("/") puts them back.
        // Let's assume our uploads are flat in the 'uploads' root for now.
    }

    // Actually, since params.path is an array of segments, a request to /api/files/foo/bar.jpg
    // gives path=['foo', 'bar.jpg']. We want to strictly limit to the 'uploads' directory.
    // If we want to support subdirectories, we need to be careful.
    // For now, let's assume flat structure as per upload route: Date.now() + "_" + name

    // Security check: ensure the resolved path is within the uploads directory
    const uploadDir = path.join(process.cwd(), "uploads");
    const fullPath = path.join(uploadDir, filename);

    // Normalize paths to check for traversal
    const relative = path.relative(uploadDir, fullPath);
    if (relative && relative.startsWith("..") && !path.isAbsolute(relative)) {
        return new NextResponse("Invalid path", { status: 403 });
    }

    if (!existsSync(fullPath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    try {
        const fileBuffer = await readFile(fullPath);
        const contentType = mime.getType(fullPath) || "application/octet-stream";

        const headers: Record<string, string> = {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
        };

        const { searchParams } = req.nextUrl;
        if (searchParams.get("download") === "true") {
            const basename = path.basename(filename);
            let downloadFilename = basename;
            // Try to remove timestamp prefix if present (format: timestamp_filename)
            const match = basename.match(/^\d+_(.+)$/);
            if (match && match[1]) {
                downloadFilename = match[1];
            }
            headers["Content-Disposition"] = `attachment; filename="${downloadFilename}"`;
        }

        return new NextResponse(fileBuffer, {
            headers,
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
