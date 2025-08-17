"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/authProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PhoneNumberForm() {
  const { supabase } = useAuth();
  const [phone, setPhone] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setError(null);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        if (!isMounted) return;
        setError(error.message);
        return;
      }
      const currentPhone = (data.user?.user_metadata?.phone as string) || "";
      if (!isMounted) return;
      setPhone(currentPhone);
      setInitialPhone(currentPhone);
    })();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Basic normalization: keep digits only
      const normalized = phone.replace(/[^0-9+]/g, "");
      const { error } = await supabase.auth.updateUser({
        data: { phone: normalized },
      });
      if (error) throw error;
      setInitialPhone(normalized);
      setSuccess("Phone number updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update phone number");
    } finally {
      setLoading(false);
    }
  };

  const canSave = phone.trim() !== initialPhone.trim() && phone.trim().length > 0;

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          placeholder="e.g. +254712345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={!canSave || loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" disabled={loading} onClick={() => setPhone(initialPhone)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
