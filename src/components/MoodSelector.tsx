import { Button } from "@/components/ui/button";
import { MOOD_CONFIG, type MoodType } from "@/lib/types";

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
  disabled?: boolean;
}

export function MoodSelector({ selectedMood, onMoodSelect, disabled }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-3" role="group" aria-label="Select your current mood">
      {(Object.entries(MOOD_CONFIG) as [MoodType, { emoji: string; label: string; score: number }][]).map(
        ([mood, config]) => (
          <Button
            key={mood}
            variant={selectedMood === mood ? "default" : "outline"}
            className="h-14 text-2xl flex flex-col gap-0.5"
            onClick={() => onMoodSelect(mood)}
            aria-label={`Select mood: ${config.label}`}
            aria-pressed={selectedMood === mood}
            disabled={disabled}
          >
            <span aria-hidden="true">{config.emoji}</span>
            <span className="text-[10px] font-medium">{config.label}</span>
          </Button>
        )
      )}
    </div>
  );
}
