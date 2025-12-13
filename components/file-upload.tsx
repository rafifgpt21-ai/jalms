"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "sonner";
import { X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
    onChange: (url?: string) => void;
    value?: string;
    endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ onChange, value, endpoint }: FileUploadProps) => {
    const fileType = value?.split(".").pop();

    if (value && fileType !== "pdf") {
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                <div className="relative w-10 h-10 overflow-hidden rounded-full">
                    {/* Fallback for non-image files */}
                    <div className="flex items-center justify-center w-full h-full bg-slate-200 text-slate-500">
                        {fileType}
                    </div>
                </div>
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                    {value}
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
                        PDF
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

    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                onChange(res?.[0].url);
            }}
            onUploadError={(error: Error) => {
                toast.error(`${error?.message}`);
            }}
        />
    );
}
