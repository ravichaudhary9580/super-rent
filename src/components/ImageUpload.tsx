"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Loader2, AlertCircle, FileCheck } from "lucide-react";
import { convertToWebP } from "@/lib/imageUtils";

interface ImageUploadProps {
  onUploadComplete: (urls: string[]) => void;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number; // Size limit in Megabytes (e.g. 5MB)
  initialImages?: string[];
  label?: string;
  description?: string;
}

export function ImageUpload({
  onUploadComplete,
  folder = "properties",
  multiple = false,
  maxFiles = 6,
  maxSizeMB = 5,
  initialImages = [],
  label = "Upload Images",
  description = `Images are auto-optimized to WebP (Max ${maxSizeMB}MB per file)`,
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setErrorMessage("");

    const files = Array.from(fileList);

    if (multiple && images.length + files.length > maxFiles) {
      setErrorMessage(`You can upload a maximum of ${maxFiles} images.`);
      return;
    }

    // 1. Validate File Sizes
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed size limit of ${maxSizeMB}MB.`
        );
        return;
      }
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          throw new Error(`File "${file.name}" is not an image.`);
        }

        // 2. Convert & Compress to WebP
        setStatusText(`Optimizing image ${i + 1}/${files.length} to WebP...`);
        const webpFile = await convertToWebP(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
        });

        // 3. Upload to AWS S3
        setStatusText(`Uploading ${webpFile.name} to AWS S3...`);
        const formData = new FormData();
        formData.append("file", webpFile);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to upload image to AWS S3.");
        }

        uploadedUrls.push(data.fileUrl);
      }

      const updated = multiple ? [...images, ...uploadedUrls] : [uploadedUrls[0]];
      setImages(updated);
      onUploadComplete(updated);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Failed to process and upload image.");
    } finally {
      setIsUploading(false);
      setStatusText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updated);
    onUploadComplete(updated);
  };

  return (
    <div className="space-y-3 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[11px] font-semibold text-slate-400">
            {multiple ? `${images.length} / ${maxFiles} uploaded` : "Single Image"} (Max {maxSizeMB}MB)
          </span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!isUploading) handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isUploading
            ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 cursor-not-allowed"
            : "border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {statusText || "Processing & Uploading to AWS S3..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Click or drag & drop to upload
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((url, idx) => (
            <div
              key={url + idx}
              className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-square shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Uploaded ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
