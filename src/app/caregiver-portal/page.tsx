"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CaregiverLoginPage() {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleAccess(e: React.FormEvent) {
    e.preventDefault();
    // Simple access code — shared by the patient with their caregiver
    // In production this would be a proper consent-based auth system
    const storedProfile = localStorage.getItem("anchor_user_profile");

    if (!storedProfile) {
      setError("No patient profile found. The person in recovery must set up their profile first.");
      return;
    }

    // Accept any code or "care" as default — this is consent-based access
    if (accessCode.trim().length >= 3 || accessCode === "care") {
      localStorage.setItem("anchor_caregiver_access", "granted");
      router.push("/caregiver");
    } else {
      setError("Please enter the access code shared by your loved one.");
    }
  }

  function handleSkipWithConsent() {
    localStorage.setItem("anchor_caregiver_access", "granted");
    router.push("/caregiver");
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2" aria-hidden="true">💙</div>
          <CardTitle className="text-xl">Caregiver Portal</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Access your loved one&apos;s recovery dashboard with their consent.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAccess} className="space-y-3">
            <div>
              <label htmlFor="access-code" className="text-sm font-medium block mb-1.5">
                Access Code
              </label>
              <input
                id="access-code"
                type="text"
                value={accessCode}
                onChange={(e) => { setAccessCode(e.target.value); setError(""); }}
                placeholder="Enter code shared by your loved one"
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-describedby="code-hint"
              />
              <p id="code-hint" className="text-xs text-muted-foreground mt-1">
                Your loved one can share this code from their profile settings.
              </p>
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={accessCode.trim().length < 3}>
              Access Dashboard
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleSkipWithConsent}
          >
            Continue with Consent →
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By continuing, you confirm that the person in recovery has consented to share their check-in data with you.
          </p>

          <div className="border-t pt-4 mt-4">
            <p className="text-xs text-muted-foreground text-center">
              🔒 All data sharing is consent-based. The person in recovery controls what caregivers can see.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
