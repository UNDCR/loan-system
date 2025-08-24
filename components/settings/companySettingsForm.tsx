"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SettingsRecord } from "@/lib/types";
import { setSettingsFormAction } from "@/actions/settings";
import { useActionState } from "react";
import ImageUpload from "@/components/settings/imageUpload";
import { toast } from "sonner";

type CompanyState = {
  name: string;
  email: string;
  phone: string;
  url: string;
  logoUrl: string;
};

type Props = {
  initial?: SettingsRecord | null;
};

export default function CompanySettingsForm({ initial: initialRecord }: Props) {
  const [initial, setInitial] = useState<CompanyState>({ name: "", email: "", phone: "", url: "", logoUrl: "" });
  const [form, setForm] = useState<CompanyState>(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialRecord) {
      const mapped: CompanyState = {
        name: initialRecord.company_name ?? "",
        email: initialRecord.company_email ?? "",
        phone: initialRecord.company_number ?? "",
        url: initialRecord.company_url ?? "",
        logoUrl: initialRecord.company_logo ?? "",
      };
      setInitial(mapped);
      setForm(mapped);
    }
  }, [initialRecord]);

  const canSave = useMemo(() => {
    const changed =
      form.name.trim() !== initial.name.trim() ||
      form.email.trim() !== initial.email.trim() ||
      form.phone.trim() !== initial.phone.trim() ||
      form.url.trim() !== initial.url.trim() ||
      form.logoUrl.trim() !== initial.logoUrl.trim();
    const requiredValid = form.name.trim().length > 0 && form.email.trim().length > 0;
    return editing && changed && requiredValid && !saving;
  }, [editing, form, initial, saving]);

  const onEdit = () => {
    setForm(initial);
    setEditing(true);
  };

  const onCancel = () => {
    setForm(initial);
    setEditing(false);
  };

  const [state, formAction, isPending] = useActionState(setSettingsFormAction, {});
  const [, startTransition] = useTransition();

  const onSave = () => {
    setSaving(true);
    const fd = new FormData();
    fd.set("company_name", form.name);
    fd.set("company_email", form.email);
    fd.set("company_number", form.phone);
    fd.set("company_url", form.url);
    fd.set("company_logo", form.logoUrl);
    startTransition(() => {
      formAction(fd);
    });
  };

  useEffect(() => {
    if (state && state.success && state.data) {
      const mapped: CompanyState = {
        name: state.data.company_name ?? "",
        email: state.data.company_email ?? "",
        phone: state.data.company_number ?? "",
        url: state.data.company_url ?? "",
        logoUrl: state.data.company_logo ?? "",
      };
      setInitial(mapped);
      setForm(mapped);
      setEditing(false);
      setSaving(false);
      toast.success("Settings saved");
    }
    if (state && state.error) {
      setSaving(false);
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            disabled={!editing}
            placeholder="e.g. Acme Inc."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company-email">Company Email</Label>
          <Input
            id="company-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            disabled={!editing}
            placeholder="e.g. hello@acme.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company-phone">Company Number</Label>
          <Input
            id="company-phone"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            disabled={!editing}
            placeholder="e.g. +254712345678"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company-url">Company URL</Label>
          <Input
            id="company-url"
            type="url"
            value={form.url}
            onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))}
            disabled={!editing}
            placeholder="e.g. https://acme.com"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[180px_1fr] items-start">
        <div className="flex items-center justify-center rounded-md border bg-muted/30 p-2 min-h-24">
          {form.logoUrl ? (
            <Image src={form.logoUrl} alt="Company logo" width={160} height={80} className="object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">No logo</span>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Company Logo</Label>
          <ImageUpload
            onUploaded={(url) => setForm((s) => ({ ...s, logoUrl: url }))}
            disabled={!editing}
          />
          <p className="text-xs text-muted-foreground">Use a small PNG for best results.</p>
        </div>
      </div>

      <div className="flex gap-2">
        {!editing && (
          <Button type="button" onClick={onEdit} variant="outline">
            Edit
          </Button>
        )}
        {editing && (
          <>
            <Button type="button" onClick={onSave} disabled={!canSave || isPending}>
              {saving || isPending ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
          </>
        )}
      </div>

      {state && state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
