import { learnBuffer, type Journey, type LearnedBuffer } from '@nowish/domain';

import type { Settings } from '@/providers/settings';

export interface EffectiveBuffer {
  minutes: number;
  /** Set when the learned value is in use. */
  learned: LearnedBuffer | null;
}

/** The buffer every leave plan uses: learned when switched on and there is enough history, else fixed. */
export function effectiveBuffer(settings: Settings, journeys: readonly Journey[]): EffectiveBuffer {
  const learned = settings.bufferLearning ? learnBuffer(journeys, settings.dawdleBuffer) : null;
  return { minutes: learned?.minutes ?? settings.dawdleBuffer, learned };
}
