"use client";

import { cn } from '@/lib/utils';

export type FrequencyCode = 'once' | 'weekly' | 'biweekly';

export const FREQ: Record<FrequencyCode, { title: string; note?: string; discount: number; label_nl: string }> = {
  once:     { title: 'Try it once', note: undefined,         discount: 0,    label_nl: 'Eenmalig' },
  weekly:   { title: 'Weekly',      note: 'Save 7%',         discount: 0.07, label_nl: 'Wekelijks (bespaar 7%)' },
  biweekly: { title: 'Bi-weekly',   note: 'Save 4%',         discount: 0.04, label_nl: 'Om de week (bespaar 4%)' },
};

export function FrequencyCards({ value, onChange }:{
  value: FrequencyCode; onChange:(v:FrequencyCode)=>void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {(Object.keys(FREQ) as FrequencyCode[]).map(code => {
        const active = value===code;
        const f = FREQ[code];
        return (
          <button
            key={code}
            type="button"
            onClick={()=>onChange(code)}
            className={cn(
              "rounded-lg p-4 border transition-all text-left",
              active ? 'border-primary bg-primary/5 text-primary' : 'border-input hover:border-primary/50'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-base">{f.label_nl}</span>
              {f.note && <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white">{f.note}</span>}
            </div>
            {active && <div className="mt-2 text-primary text-sm">Geselecteerd</div>}
          </button>
        );
      })}
    </div>
  );
}