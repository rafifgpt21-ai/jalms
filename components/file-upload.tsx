"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, UploadCloud, Loader2, FileIcon } from "lucide-react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value?: string;
    endpoint?: string;
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileType = value?.split(".").pop();

    if (value && fileType !== "pdf") {
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <div className="relative w-10 h-10 overflow-hidden rounded-full">
                    <Image
                        fill
                        src={value}
                        alt="Upload"
                        className="object-cover"
                    />
                </div>
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                    View Image
                </a>
                <button
                    onClick={() => onChange("")}
                    className="absolute top-0 right-0 p-1 text-white rounded-full bg-rose-500/80 hover:bg-rose-600/90 shadow-sm backdrop-blur-sm border border-white/20 transition-all"
                    type="button"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    if (value && fileType === "pdf") {
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 text-red-500 flex items-center justify-center rounded-md">
                        <span className="text-xs font-bold">PDF</span>
                    </div>
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                    >
                        View PDF
                    </a>
                </div>
                <button
                    onClick={() => onChange("")}
                    className="absolute -top-2 -right-2 p-1 text-white rounded-full bg-rose-500/80 hover:bg-rose-600/90 shadow-sm backdrop-blur-sm border border-white/20 transition-all"
                    type="button"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    const onUploadComplete = (res: any[]) => {
        const url = res?.[0]?.url;
        if (url) {
            onChange(url);
            toast.success("File uploaded");
        }
    }

    const onUploadError = (error: Error) => {
        toast.error(`Upload failed: ${error.message}`);
    }

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <UploadDropzone
                endpoint="courseUpload"
                onClientUploadComplete={onUploadComplete}
                onUploadError={onUploadError}
                appearance={{
                    container: "w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4",
                    uploadIcon: "text-slate-500",
                    label: "text-slate-500 dark:text-slate-400 hover:text-slate-600",
                    allowedContent: "hidden"
                }}
            />
        </div>
    );
}
