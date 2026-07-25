'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Anchor,
  MessageCircle,
  ClipboardList,
  BarChart3,
  Heart,
  LogOut,
  Phone,
} from 'lucide-react';

const ROLE_KEY = 'anchor_user_role';

type UserRole = 'recovery' | 'caregiver' | null;

const recoveryLinks = [
  { href: '/', label: 'Home', icon: Anchor },
  { href: '/chat', label: 'Talk', icon: MessageCircle },
  { href: '/scripts', label: 'Scripts', icon: ClipboardList },
  { href: '/checkin', label: 'Check-in', icon: BarChart3 },
  { href: '/caregiver', label: 'Caregiver', icon: Heart },
];

const caregiverLinks = [
  { href: '/', label: 'Home', icon: Anchor },
  { href: '/caregiver', label: 'Dashboard', icon: Heart },
  { href: '/caregiver-portal', label: 'Portal', icon: Heart },
  { href: '/chat', label: 'Talk', icon: MessageCircle },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    const stored = localStorage.getItem(ROLE_KEY) as UserRole;
    setRole(stored);
  }, []);

  // Don't show nav on login page
  if (pathname === '/login') return null;

  const navLinks = role === 'caregiver' ? caregiverLinks : recoveryLinks;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  function handleLogout() {
    localStorage.removeItem(ROLE_KEY);
    setRole(null);
    router.push('/login');
  }

  return (
    <>
      {/* Top bar — minimal on mobile, full on desktop */}
      <nav
        aria-label="Main navigation"
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* App name */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <Anchor className="h-5 w-5 text-primary" />
            <span className="text-foreground">AnchorAI</span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Role badge */}
            {role && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {role === 'recovery' ? 'Recovery' : 'Caregiver'}
              </span>
            )}

            {/* SOS Button */}
            <Button variant="destructive" size="sm" className="font-semibold" render={<Link href="/crisis" />}>
              <Phone className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">SOS</span>
            </Button>

            {/* Logout */}
            {role && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Switch role"
                className="hidden md:inline-flex text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom tab bar — MOBILE ONLY */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden safe-area-bottom"
      >
        <ul className="flex items-center justify-around px-2 py-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
          {/* SOS in bottom bar */}
          <li>
            <Link
              href="/crisis"
              className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive"
            >
              <Phone className="h-5 w-5" />
              <span>SOS</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Spacer for bottom nav on mobile */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </>
  );
}
