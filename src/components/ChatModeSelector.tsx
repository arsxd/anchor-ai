import { Button } from "@/components/ui/button";
import { Waves, AlertTriangle, BookOpen, Heart } from "lucide-react";
import type { ChatMode } from "@/lib/types";

interface ChatModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const MODES: { value: ChatMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "calm", label: "Calm", icon: Waves },
  { value: "crisis", label: "Crisis", icon: AlertTriangle },
  { value: "journal", label: "Journal", icon: BookOpen },
  { value: "caregiver", label: "Caregiver", icon: Heart },
];

export function ChatModeSelector({ currentMode, onModeChange }: ChatModeSelectorProps) {
  return (
    <nav className="flex gap-1" aria-label="Chat mode selection">
      {MODES.map((m) => {
        const Icon = m.icon;
        return (
          <Button
            key={m.value}
            variant={currentMode === m.value ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange(m.value)}
            aria-pressed={currentMode === m.value}
            aria-label={`Switch to ${m.label} mode`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline ml-1">{m.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}
