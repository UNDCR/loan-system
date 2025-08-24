"use client";

import { useState } from "react";
import { useActionState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ActionState } from "@/actions/admin";
import { uploadImageFormAction } from "@/actions/images";

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [state, formAction, isPending] = useActionState<ActionState & { url?: string }, FormData>(uploadImageFormAction, {});

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const displayUrl = state.url;
  const error = state.error;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <form action={formAction} className="space-y-3">
        <input
          id="image-file"
          name="file"
          type="file"
          accept="image/png"
          onChange={onChange}
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:hover:opacity-90"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={!file || isPending}>
            {isPending ? 'Uploading...' : 'Upload'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFile(null);
              const el = document.getElementById("image-file") as HTMLInputElement | null;
              if (el) el.value = "";
            }}
          >
            Clear
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Max 500KB. PNG only.</p>
      </form>

      <div className="space-y-3">
        {displayUrl && <p className="text-sm text-green-600">Uploaded successfully</p>}
        {displayUrl && <p className="text-xs break-all">{displayUrl}</p>}
        {displayUrl && (
          <Image
            src={displayUrl}
            alt="Company logo"
            width={300}
            height={200}
            className="max-w-xs object-contain"
          />
        )}
      </div>
    </div>
  );
}
