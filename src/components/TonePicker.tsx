import { TONE_COPY, REPLY_TONES, type ReplyTone } from '@/constants/tones';
import { cn } from '@/utils/cn';

interface TonePickerProps {
  selected: ReplyTone[];
  onChange: (tones: ReplyTone[]) => void;
}

export function TonePicker({ selected, onChange }: TonePickerProps) {
  function toggle(tone: ReplyTone) {
    if (selected.includes(tone)) {
      if (selected.length === 1) return;
      onChange(selected.filter((item) => item !== tone));
      return;
    }
    onChange([...selected, tone]);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {REPLY_TONES.map((tone) => {
        const active = selected.includes(tone);
        return (
          <button
            key={tone}
            type="button"
            onClick={() => toggle(tone)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
              active
                ? 'border-violet-500/40 bg-violet-600 text-white'
                : 'border-zinc-200 bg-white/70 text-zinc-600 hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300',
            )}
          >
            {TONE_COPY[tone].label}
          </button>
        );
      })}
    </div>
  );
}
