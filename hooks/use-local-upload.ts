import { useState } from "react";
import { toast } from "sonner";

interface UseLocalUploadReturn {
    startUpload: (files: File[], folder?: string) => Promise<{ url: string; name: string }[] | undefined>;
    isUploading: boolean;
}

export function useLocalUpload(): UseLocalUploadReturn {
    const [isUploading, setIsUploading] = useState(false);

    const startUpload = async (files: File[], folder: string = "") => {
        setIsUploading(true);
        const uploadedFiles: { url: string; name: string }[] = [];

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                if (folder) {
                    formData.append("folder", folder);
                }

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to upload file");
                }

                const data = await response.json();
                uploadedFiles.push(data);
            }

            return uploadedFiles;
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error instanceof Error ? error.message : "Upload failed");
            return undefined;
        } finally {
            setIsUploading(false);
        }
    };

    return { startUpload, isUploading };
}
