'use client';

import { useRouter } from 'next/navigation';
import { Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ROLE_KEY = 'anchor_user_role';

export default function LoginPage() {
  const router = useRouter();

  function selectRole(role: 'recovery' | 'caregiver') {
    localStorage.setItem(ROLE_KEY, role);
    if (role === 'recovery') {
      router.push('/onboarding');
    } else {
      router.push('/caregiver');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to AnchorAI</h1>
          <p className="text-muted-foreground">
            Choose how you&apos;d like to use AnchorAI today
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Recovery Role */}
          <Card
            className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg focus-within:border-primary"
            onClick={() => selectRole('recovery')}
            role="button"
            tabIndex={0}
            aria-label="Continue as someone in recovery"
            onKeyDown={(e) => e.key === 'Enter' && selectRole('recovery')}
          >
            <CardHeader className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-2">
                <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">I&apos;m in Recovery</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Access AI companion, emergency scripts, daily check-ins, and crisis support.
              </p>
              <Button className="mt-4 w-full" variant="default">
                Continue
              </Button>
            </CardContent>
          </Card>

          {/* Caregiver Role */}
          <Card
            className="cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg focus-within:border-primary"
            onClick={() => selectRole('caregiver')}
            role="button"
            tabIndex={0}
            aria-label="Continue as a caregiver"
            onKeyDown={(e) => e.key === 'Enter' && selectRole('caregiver')}
          >
            <CardHeader className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 mx-auto mb-2">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">I&apos;m a Caregiver</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Monitor your loved one&apos;s wellbeing, get guidance on what to say, and access de-escalation scripts.
              </p>
              <Button className="mt-4 w-full" variant="secondary">
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground">
          Your data stays on this device. No account needed.
        </p>
      </div>
    </main>
  );
}
