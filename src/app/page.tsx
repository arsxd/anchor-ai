import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { APP_DESCRIPTION, APP_NAME, CRISIS_HOTLINES } from "@/lib/constants";
import { Mic, ClipboardList, Shield, Heart, Brain, Zap, MessageCircle, BarChart3, Phone } from "lucide-react";
import { PersonalizedInsight } from "@/components/PersonalizedInsight";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to main content
      </a>

      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 left-1/3 w-40 h-40 bg-destructive/10 rounded-full blur-[60px]" />
      </div>

      {/* Hero Section */}
      <section id="main-content" className="relative container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Powered by Google Gemini AI · Zero-Typing Interventions
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent">
          {APP_NAME}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          {APP_DESCRIPTION}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/chat">
            <Button size="lg" className="text-base w-full sm:w-auto h-12 px-8 font-semibold">
              <MessageCircle className="h-5 w-5 mr-2" /> Talk to AnchorAI
            </Button>
          </Link>
          <Link href="/checkin">
            <Button variant="outline" size="lg" className="text-base w-full sm:w-auto h-12 px-8 font-semibold">
              <BarChart3 className="h-5 w-5 mr-2" /> Daily Check-In
            </Button>
          </Link>
          <Link href="/crisis">
            <Button variant="destructive" size="lg" className="text-base w-full sm:w-auto h-12 px-8 font-semibold">
              <Phone className="h-5 w-5 mr-2" /> Crisis Support
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Multi-modal · Voice + Touch + Text · Works when cognitive load is highest
        </p>
      </section>

      {/* Personalized AI Insight — for returning users */}
      <PersonalizedInsight />

      {/* Stats Strip */}
      <section className="relative container mx-auto px-4 pb-16" aria-label="Platform statistics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl mx-auto">
          <StatCard value="<5s" label="Crisis response time" />
          <StatCard value="0✍" label="Typing needed in crisis" />
          <StatCard value="24/7" label="Always available" />
          <StatCard value="AI" label="Prevention engine" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative container mx-auto px-4 py-12" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl md:text-3xl font-bold text-center mb-10">
          Zero-Typing, Multi-Modal Support
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Mic className="h-7 w-7 text-blue-500" />}
            title="Voice-First Interaction"
            description="Speak naturally — no typing needed. AI responds with voice when your hands are shaking."
            badge="MULTI-MODAL"
          />
          <FeatureCard
            icon={<ClipboardList className="h-7 w-7 text-green-500" />}
            title="Emergency Scripts"
            description="AI generates personalized scripts for refusing substances — ready when you can't improvise."
            badge="PERSONALIZED"
          />
          <FeatureCard
            icon={<Shield className="h-7 w-7 text-amber-500" />}
            title="Prevention Engine"
            description="Detects declining mood patterns and intervenes proactively — before crisis hits."
            badge="PROACTIVE AI"
          />
          <FeatureCard
            icon={<Heart className="h-7 w-7 text-purple-500" />}
            title="Caregiver Support"
            description="Guidance for families: what to say, what to avoid, and when to get professional help."
            badge="DUAL PERSONA"
          />
          <FeatureCard
            icon={<Brain className="h-7 w-7 text-pink-500" />}
            title="Personalized AI"
            description="Knows your triggers, your 'why', and your support network. Uses YOUR words to motivate you."
            badge="CONTEXTUAL"
          />
          <FeatureCard
            icon={<Zap className="h-7 w-7 text-red-500" />}
            title="Instant Crisis Response"
            description="One tap. AI-generated grounding steps. Voice reads them aloud. Under 5 seconds."
            badge="ZERO-TYPING"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative container mx-auto px-4 py-12 text-center">
        <Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl">Ready to begin?</CardTitle>
            <CardDescription>Set up your profile in 2 minutes. Everything after that is personalized to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/onboarding">
              <Button size="lg" className="font-semibold">
                Start Onboarding →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Crisis Footer */}
      <footer className="relative border-t mt-12 py-8 text-center text-sm text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">24/7 Crisis Resources</p>
        <div className="flex flex-wrap justify-center gap-4">
          {CRISIS_HOTLINES.map((hotline) => (
            <a
              key={hotline.number}
              href={`tel:${hotline.number.replace(/-/g, "")}`}
              className="text-primary hover:underline"
              aria-label={`Call ${hotline.name} at ${hotline.number}`}
            >
              {hotline.name}: {hotline.number}
            </a>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          ⚠️ {APP_NAME} is a supportive tool and does not replace professional medical care, therapy, or emergency services.
        </p>
      </footer>
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description, badge }: { icon: React.ReactNode; title: string; description: string; badge: string }) {
  return (
    <Card className="text-left hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span aria-hidden="true">{icon}</span>
          <span className="text-[10px] font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{badge}</span>
        </div>
        <CardTitle className="text-base mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
