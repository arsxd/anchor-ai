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
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Phone,
} from 'lucide-react';

const ROLE_KEY = 'anchor_user_role';

type UserRole = 'recovery' | 'caregiver' | null;

const recoveryLinks = [
  { href: '/', label: 'Home', icon: Anchor },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/scripts', label: 'Scripts', icon: ClipboardList },
  { href: '/checkin', label: 'Check-in', icon: BarChart3 },
];

const caregiverLinks = [
  { href: '/', label: 'Home', icon: Anchor },
  { href: '/caregiver', label: 'Dashboard', icon: Heart },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* App name */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Anchor className="h-5 w-5 text-primary" />
          <span>AnchorAI</span>
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
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive(link.href)
                      ? 'bg-accent text-accent-foreground'
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
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {role === 'recovery' ? (
                <><Heart className="h-3 w-3" /> Recovery</>
              ) : (
                <><Heart className="h-3 w-3" /> Caregiver</>
              )}
            </span>
          )}

          {/* SOS Button - always visible */}
          <Button variant="destructive" size="sm" render={<Link href="/crisis" />}>
            <Phone className="h-4 w-4 mr-1" />
            SOS
          </Button>

          {/* Logout / Switch role */}
          {role && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              aria-label="Switch role"
              className="hidden sm:inline-flex"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="border-t md:hidden">
          <ul className="space-y-1 px-4 py-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isActive(link.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {role && (
              <li>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Switch Role
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
