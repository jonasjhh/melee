export type BuffType = 'haste' | 'bless' | 'regen' | 'defending';

export interface Buff {
  type: BuffType;
  duration: number; // Turns remaining
  value: number; // Magnitude of effect (e.g., +10 power for bless, +5 HP/turn for regen)
  source?: string; // Unit ID that applied the buff
}
