import { Button } from "@/components/ui/button";
import type { ChatMode } from "@/lib/types";

interface ChatModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const MODES: { value: ChatMode; label: string; emoji: string }[] = [
  { value: "calm", label: "Calm", emoji: "🌊" },
  { value: "crisis", label: "Crisis", emoji: "🆘" },
  { value: "journal", label: "Journal", emoji: "📓" },
  { value: "caregiver", label: "Caregiver", emoji: "💙" },
];

export function ChatModeSelector({ currentMode, onModeChange }: ChatModeSelectorProps) {
  return (
    <nav className="flex gap-1" aria-label="Chat mode selection">
      {MODES.map((m) => (
        <Button
          key={m.value}
          variant={currentMode === m.value ? "default" : "outline"}
          size="sm"
          onClick={() => onModeChange(m.value)}
          aria-pressed={currentMode === m.value}
          aria-label={`Switch to ${m.label} mode`}
        >
          <span aria-hidden="true">{m.emoji}</span>
          <span className="hidden sm:inline ml-1">{m.label}</span>
        </Button>
      ))}
    </nav>
  );
}
