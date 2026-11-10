import type { ReactNode } from 'react';

/** Native: the app fills the device. The web variant (PreviewFrame.web.tsx) adds a phone-sized frame. */
export function PreviewFrame({ children }: { children: ReactNode }) {
  return children;
}
