'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { UserProfile } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/constants';

const COPING_OPTIONS = [
  'breathwork',
  'journaling',
  'physical activity',
  'talking to someone',
  'meditation',
] as const;

const RECOVERY_STAGES = [
  { value: 'early', label: 'Early Recovery' },
  { value: 'middle', label: 'Middle Recovery' },
  { value: 'maintenance', label: 'Maintenance' },
] as const;

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [recoveryStage, setRecoveryStage] = useState<'early' | 'middle' | 'maintenance'>('early');
  const [triggers, setTriggers] = useState('');
  const [myWhy, setMyWhy] = useState('');
  const [copingPreferences, setCopingPreferences] = useState<string[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function handleCopingChange(option: string, checked: boolean) {
    setCopingPreferences((prev) =>
      checked ? [...prev, option] : prev.filter((p) => p !== option)
    );
  }

  function validate(): string[] {
    const validationErrors: string[] = [];
    if (!name.trim()) {
      validationErrors.push('Name is required.');
    }
    if (!myWhy.trim()) {
      validationErrors.push('"My Why" is required.');
    }
    return validationErrors;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);

    const profile: UserProfile = {
      name: name.trim(),
      recoveryStage,
      triggers: triggers
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      myWhy: myWhy.trim(),
      copingPreferences,
      supportContacts: [
        {
          name: contactName.trim(),
          relationship: contactRelationship.trim(),
          phone: contactPhone.trim(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Profile Saved!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your profile has been created successfully. You&apos;re ready to start your recovery journey.
            </p>
            <Link href="/chat">
              <Button className="mt-2">Go to Chat</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome — Let&apos;s Set Up Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {errors.length > 0 && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <ul className="list-disc pl-4">
                  {errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                aria-describedby="name-hint"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                placeholder="Your name"
              />
              <p id="name-hint" className="text-xs text-muted-foreground">
                How you&apos;d like to be addressed.
              </p>
            </div>

            {/* Recovery Stage */}
            <div className="space-y-1.5">
              <label htmlFor="recovery-stage" className="block text-sm font-medium">
                Recovery Stage
              </label>
              <select
                id="recovery-stage"
                aria-describedby="recovery-stage-hint"
                value={recoveryStage}
                onChange={(e) =>
                  setRecoveryStage(e.target.value as 'early' | 'middle' | 'maintenance')
                }
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              >
                {RECOVERY_STAGES.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
              <p id="recovery-stage-hint" className="text-xs text-muted-foreground">
                Where you are in your recovery journey.
              </p>
            </div>

            {/* Triggers */}
            <div className="space-y-1.5">
              <label htmlFor="triggers" className="block text-sm font-medium">
                Triggers
              </label>
              <input
                id="triggers"
                type="text"
                aria-describedby="triggers-hint"
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                placeholder="e.g. stress, social events, loneliness"
              />
              <p id="triggers-hint" className="text-xs text-muted-foreground">
                Comma-separated list of your known triggers.
              </p>
            </div>

            {/* My Why */}
            <div className="space-y-1.5">
              <label htmlFor="my-why" className="block text-sm font-medium">
                My Why <span className="text-destructive">*</span>
              </label>
              <textarea
                id="my-why"
                required
                aria-describedby="my-why-hint"
                value={myWhy}
                onChange={(e) => setMyWhy(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 resize-none"
                placeholder="Why recovery matters to you..."
              />
              <p id="my-why-hint" className="text-xs text-muted-foreground">
                Your personal reason for pursuing recovery. This can be revisited anytime.
              </p>
            </div>

            {/* Coping Preferences */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Coping Preferences</legend>
              <p id="coping-hint" className="text-xs text-muted-foreground">
                Select the coping strategies that resonate with you.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-describedby="coping-hint">
                {COPING_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 has-[:checked]:border-ring has-[:checked]:bg-ring/5"
                  >
                    <input
                      type="checkbox"
                      value={option}
                      checked={copingPreferences.includes(option)}
                      onChange={(e) => handleCopingChange(option, e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Support Contact */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Support Contact</legend>
              <p id="contact-hint" className="text-xs text-muted-foreground">
                Someone you trust who can support you.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-describedby="contact-hint">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="block text-xs font-medium">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                    placeholder="Contact name"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="contact-relationship" className="block text-xs font-medium">
                    Relationship
                  </label>
                  <input
                    id="contact-relationship"
                    type="text"
                    value={contactRelationship}
                    onChange={(e) => setContactRelationship(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                    placeholder="e.g. Sponsor"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="contact-phone" className="block text-xs font-medium">
                    Phone
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                    placeholder="555-123-4567"
                  />
                </div>
              </div>
            </fieldset>

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg">
              Save Profile & Get Started
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
