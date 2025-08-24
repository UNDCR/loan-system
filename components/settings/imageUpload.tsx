"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ActionState } from "@/actions/admin";
import { uploadImageFormAction } from "@/actions/images";
import { toast } from "sonner";

type Props = {
  onUploaded: (url: string) => void;
  disabled?: boolean;
};

export default function ImageUpload({ onUploaded, disabled }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [state, formAction, isPending] = useActionState<ActionState & { url?: string }, FormData>(uploadImageFormAction, {});

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const displayUrl = state.url;
  const error = state.error;

  useEffect(() => {
    if (displayUrl) {
      onUploaded(displayUrl);
      toast.success("Image uploaded");
    }
  }, [displayUrl, onUploaded]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <form action={formAction} className="space-y-3">
      <input
        id="image-file"
        name="file"
        type="file"
        accept="image/png"
        onChange={onChange}
        disabled={disabled || isPending}
        className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:hover:opacity-90 disabled:opacity-60"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={disabled || !file || isPending}>
          {isPending ? "Uploading..." : "Upload"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isPending}
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
  );
}
