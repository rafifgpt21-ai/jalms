import { useState } from "react";
import { toast } from "sonner";

interface UseLocalUploadReturn {
    startUpload: (files: File[], folder?: string) => Promise<{ url: string; name: string }[] | undefined>;
    isUploading: boolean;
}

export function useLocalUpload(): UseLocalUploadReturn {
    const [isUploading, setIsUploading] = useState(false);

    const startUpload = async (files: File[]) => {
        setIsUploading(true);
        const uploadedFiles: { url: string; name: string }[] = [];

        try {
            // Keep UploadThing out of the initial page bundle; it is only needed once an upload starts.
            const { uploadFiles } = await import("@/lib/uploadthing");
            // We use the "courseUpload" endpoint we defined in core.ts
            // Note: UploadThing doesn't strictly use "folders" in the same way, but we can pass it as input if we extended the metadata 
            // For now, we just upload to the configured bucket
            const res = await uploadFiles("courseUpload", {
                files,
            });

            if (!res) throw new Error("Upload failed - no response");

            // Transform UploadThing response to match our expected format
            res.forEach((file) => {
                uploadedFiles.push({
                    url: file.ufsUrl || file.url,
                    name: file.name
                });
            });

            return uploadedFiles;
        } catch (error) {
            console.error("Upload error:", error);
            // Improve error message for UploadThing specific errors
            const msg = error instanceof Error ? error.message : "Upload failed";
            toast.error(`Upload failed: ${msg}`);
            return undefined;
        } finally {
            setIsUploading(false);
        }
    };

    return { startUpload, isUploading };
}
