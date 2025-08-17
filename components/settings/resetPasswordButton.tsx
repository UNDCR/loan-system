"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/authProvider";
import { Button } from "@/components/ui/button";

export default function ResetPasswordButton() {
  const { supabase } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      setEmail(data.user?.email ?? null);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const onClick = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!email) throw new Error("No email associated with this account");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess("Password reset link sent to " + email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {email && (
        <p className="text-sm text-muted-foreground">Signed in as {email}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <Button onClick={onClick} disabled={loading || !email} className="w-full">
        {loading ? "Sending..." : "Send reset link to my email"}
      </Button>
    </div>
  );
}
