"use client";

import { useState, useRef, useCallback, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { X, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface CustomUploadDropzoneProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: "square" | "wide";
  maxSizeMB?: number;
}

export function CustomUploadDropzone({
  label,
  value,
  onChange,
  aspectRatio = "square",
  maxSizeMB = 4
}: CustomUploadDropzoneProps) {
  const previewUrl = useRef<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create immediate preview (temporary, no upload yet)
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
    }
    const preview = URL.createObjectURL(file);
    previewUrl.current = preview;
    onChange(preview); // This will be the blob URL for preview only
    
    toast.success(`${file.name} selected - will upload when you save`);
  }, [onChange, maxSizeMB]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemove = () => {
    onChange("");
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }
  };

  const containerClass = aspectRatio === "square" ? "size-24" : "w-full h-32";
  const dropzoneClass = aspectRatio === "square" ? "h-24" : "h-32";

  if (value) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className={`relative ${containerClass}`}>
          <Image
            src={value}
            alt={label}
            width={aspectRatio === "square" ? 96 : 400}
            height={aspectRatio === "square" ? 96 : 128}
            className={`rounded-lg object-cover border-2 border-border ${containerClass}`}
            unoptimized
          />

          <Button
            type="button"
            onClick={handleRemove}
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 size-6 rounded-full shadow-lg"

          >
            <X className="size-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${dropzoneClass}
          ${isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }
          flex flex-col items-center justify-center gap-2
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2 text-center px-4">
          {isDragActive ? (
            <>
              <Upload className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium text-primary">Drop image here</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Choose image or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}