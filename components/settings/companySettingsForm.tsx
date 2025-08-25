"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SettingsRecord } from "@/lib/types";
import { setSettingsFormAction } from "@/actions/settings";
import { useActionState } from "react";
import { toast } from "sonner";

type CompanyState = {
  name: string;
  email: string;
  phone: string;
  url: string;
  storageFee: string;
};

type Props = {
  initial?: SettingsRecord | null;
};

export default function CompanySettingsForm({ initial: initialRecord }: Props) {
  const [initial, setInitial] = useState<CompanyState>({ name: "", email: "", phone: "", url: "", storageFee: "" });
  const [form, setForm] = useState<CompanyState>(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialRecord) {
      const storageFeeValue = initialRecord.storage_fee ?? initialRecord.storage_fee ?? null;
      const mapped: CompanyState = {
        name: initialRecord.company_name ?? "",
        email: initialRecord.company_email ?? "",
        phone: initialRecord.company_number ?? "",
        url: initialRecord.company_url ?? "",
        storageFee: storageFeeValue?.toString() ?? "",
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
      form.storageFee.trim() !== initial.storageFee.trim();
    const requiredValid = form.name.trim().length > 0 && form.email.trim().length > 0;
    const storageFeeValid = form.storageFee.trim() === "" || !isNaN(Number(form.storageFee.trim()));
    return editing && changed && requiredValid && storageFeeValid && !saving;
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
    fd.set("company_logo", initialRecord?.company_logo ?? "");
    fd.set("storage_fee", form.storageFee.trim() === "" ? "" : form.storageFee);
    startTransition(() => {
      formAction(fd);
    });
  };

  useEffect(() => {
    if (state && state.success && state.data) {
      const storageFeeValue = state.data.storage_fee ?? state.data.storage_fee ?? null;
      const mapped: CompanyState = {
        name: state.data.company_name ?? "",
        email: state.data.company_email ?? "",
        phone: state.data.company_number ?? "",
        url: state.data.company_url ?? "",
        storageFee: storageFeeValue?.toString() ?? "",
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
        <div className="grid gap-2">
          <Label htmlFor="storage-fee">Daily Storage Fee</Label>
          <Input
            id="storage-fee"
            type="number"
            min={7.5}
            value={form.storageFee}
            onChange={(e) => setForm((s) => ({ ...s, storageFee: e.target.value }))}
            disabled={!editing}
            placeholder="Input daily storage fee"
          />
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
