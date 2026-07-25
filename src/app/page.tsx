import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { APP_DESCRIPTION, APP_NAME, CRISIS_HOTLINES } from "@/lib/constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
        Skip to main content
      </a>

      {/* Hero Section */}
      <section id="main-content" className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Powered by Google Gemini AI
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          {APP_NAME}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          {APP_DESCRIPTION}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chat">
            <Button size="lg" className="text-base w-full sm:w-auto">
              <span aria-hidden="true">🤖</span> Talk to AnchorAI
            </Button>
          </Link>
          <Link href="/checkin">
            <Button variant="outline" size="lg" className="text-base w-full sm:w-auto">
              <span aria-hidden="true">📊</span> Daily Check-In
            </Button>
          </Link>
          <Link href="/crisis">
            <Button variant="destructive" size="lg" className="text-base w-full sm:w-auto">
              <span aria-hidden="true">🆘</span> Crisis Support
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl font-bold text-center mb-8">
          Zero-Typing, Multi-Modal Support
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon="🎙️"
            title="Voice-First Interaction"
            description="Speak naturally — no typing needed. AI responds with voice when your hands are shaking."
          />
          <FeatureCard
            icon="📋"
            title="Emergency Scripts"
            description="AI generates personalized scripts for refusing substances — ready when you can't improvise."
          />
          <FeatureCard
            icon="🛡️"
            title="Prevention Engine"
            description="Detects declining mood patterns and intervenes proactively — before crisis hits."
          />
          <FeatureCard
            icon="💙"
            title="Caregiver Support"
            description="Guidance for families: what to say, what to avoid, and when to get professional help."
          />
          <FeatureCard
            icon="🧠"
            title="Personalized AI"
            description="Knows your triggers, your 'why', and your support network. Uses YOUR words to motivate you."
          />
          <FeatureCard
            icon="⚡"
            title="Instant Crisis Response"
            description="One tap. AI-generated grounding steps. Voice reads them aloud. Under 5 seconds."
          />
        </div>
      </section>

      {/* Crisis Footer */}
      <footer className="border-t mt-12 py-8 text-center text-sm text-muted-foreground">
        <p className="mb-2 font-medium">24/7 Crisis Resources</p>
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

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <Card className="text-left">
      <CardHeader>
        <span aria-hidden="true" className="text-3xl mb-2 block">{icon}</span>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
