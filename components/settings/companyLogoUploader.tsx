"use client";

import { useEffect, useMemo, useRef, useState, startTransition, type DragEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import { toast } from "sonner";
import { uploadImageFormAction } from "@/actions/images";
import { setCompanyLogoAction } from "@/actions/settings";
import { useRouter } from "next/navigation";

type Props = {
  initialUrl?: string | null;
};

type State = { success?: boolean; error?: string; url?: string };

export default function CompanyLogoUploader({ initialUrl }: Props) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, uploadAction, uploading] = useActionState<State, FormData>(uploadImageFormAction, {});
  const [persistState, persistAction, persisting] = useActionState<{ success?: boolean; error?: string }, FormData>(setCompanyLogoAction, {});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [cacheBust, setCacheBust] = useState<string>("");

  const busy = uploading || persisting;
  const canUpload = useMemo(() => !!selectedFile && !busy, [selectedFile, busy]);

  useEffect(() => {
    const v = sessionStorage.getItem("company_logo_cache_bust") ?? "";
    setCacheBust(v);
    if (v) sessionStorage.removeItem("company_logo_cache_bust");
  }, []);

  const displayUrl = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (!initialUrl) return "";
    if (!cacheBust) return initialUrl;
    const sep = initialUrl.includes("?") ? "&" : "?";
    return `${initialUrl}${sep}t=${cacheBust}`;
  }, [previewUrl, initialUrl, cacheBust]);

  useEffect(() => {
    if (uploadState && uploadState.success && uploadState.url) {
      const fd = new FormData();
      fd.set("url", uploadState.url);
      startTransition(() => {
        persistAction(fd);
      });
    }
    if (uploadState && uploadState.error) {
      toast.error(uploadState.error);
    }
  }, [uploadState, persistAction]);

  useEffect(() => {
    if (persistState && persistState.success) {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setSelectedFile(null);
      setPreviewUrl("");
      const ts = String(Date.now());
      sessionStorage.setItem("company_logo_cache_bust", ts);
      setCacheBust(ts);
      toast.success("Logo updated");
      router.refresh();
    }
    if (persistState && persistState.error) {
      toast.error(persistState.error);
    }
  }, [persistState, router, previewUrl]);

  return (
    <div className="grid gap-3">
      <input
        ref={inputRef}
        id="image-file"
        name="file"
        type="file"
        accept="image/png"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (!f) {
            setSelectedFile(null);
            setPreviewUrl(initialUrl ?? "");
            return;
          }
          if (f.type !== "image/png") {
            toast.error("Only PNG images are allowed");
            e.currentTarget.value = "";
            setSelectedFile(null);
            setPreviewUrl(initialUrl ?? "");
            return;
          }
          if (f.size > 500 * 1024) {
            toast.error("File too large. Max 500KB");
            e.currentTarget.value = "";
            setSelectedFile(null);
            setPreviewUrl(initialUrl ?? "");
            return;
          }
          setSelectedFile(f);
          const url = URL.createObjectURL(f);
          setPreviewUrl(url);
        }}
        className="hidden"
      />
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop PNG here or click to choose"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragEnter={() => setDragging(true)}
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0] ?? null;
          if (!f) return;
          if (f.type !== "image/png") {
            toast.error("Only PNG images are allowed");
            return;
          }
          if (f.size > 500 * 1024) {
            toast.error("File too large. Max 500KB");
            return;
          }
          setSelectedFile(f);
          const url = URL.createObjectURL(f);
          setPreviewUrl(url);
        }}
        className={`flex items-center justify-center rounded-md border bg-muted/30 p-2 min-h-24 cursor-pointer ${dragging ? "border-primary ring-2 ring-primary/20" : ""}`}
      >
        {displayUrl ? (
          <Image src={displayUrl} alt="Company logo" width={160} height={80} className="object-contain" unoptimized />
        ) : (
          <span className="text-xs text-muted-foreground">No logo</span>
        )}
      </div>
      <div className="grid gap-2">
        <Label>Company Logo</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
              setSelectedFile(null);
              setPreviewUrl(initialUrl ?? "");
            }}
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!selectedFile) return;
              const fd = new FormData();
              fd.set("file", selectedFile);
              startTransition(() => {
                uploadAction(fd);
              });
            }}
            disabled={!canUpload}
          >
            {busy ? "Uploading..." : "Upload"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">PNG only. Max 500KB.</p>
      </div>
    </div>
  );
}
