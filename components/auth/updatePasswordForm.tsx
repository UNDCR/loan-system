"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/authProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const { updatePassword, supabase, session, isLoading: authLoading } = useAuth();

  useEffect(() => {
    let active = true;
    if (typeof window !== "undefined" && !session) {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash;
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token });
      }
    }
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setReady(!!data.session);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setReady(!!sess);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, session]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!session) {
        setError("Reset link is invalid or has expired. Please request a new email.");
        return;
      }
      await updatePassword(password);
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!ready || authLoading}
                />
              </div>
              {!ready && !authLoading && (
                <p className="text-sm text-muted-foreground">
                  Waiting for recovery session. If this page was not opened from your email link,
                  request a new password reset email.
                </p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading || !ready}>
                {isLoading ? "Saving..." : "Save new password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

