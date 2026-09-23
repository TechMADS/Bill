"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getAuthSession, loadShopProfile, loginWithCredentials, setAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getAuthSession()?.shopId) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Please enter your username and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginWithCredentials(trimmedUsername, trimmedPassword);
      const profile = await loadShopProfile(result.shopId);
      setAuthSession({
        shopId: result.shopId,
        username: trimmedUsername,
        businessName: profile.businessName || result.businessName,
        profile,
      });
      router.replace("/dashboard");
    } catch (responseError) {
      const message = responseError instanceof Error ? responseError.message : "Invalid username or password.";
      setError(message.includes("Unable to connect") || message.includes("Google Apps Script")
        ? "Unable to connect to the billing server. Please try again."
        : "Invalid username or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <Card className="w-full max-w-md overflow-hidden rounded-2xl shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <div className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Shop Login</h1>
              <p className="text-sm text-blue-100">Access your billing dashboard</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={event => setUsername(event.target.value)}
              placeholder="Enter username"
              icon={<UserRound className="h-4 w-4" />}
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
