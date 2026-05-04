import { useRef } from "react";

export interface ProgressRef {
  current: { value: number };
}

export function createProgressRef(): ProgressRef {
  return { current: { value: 0 } };
}

export function useScrollProgressRef(): ProgressRef {
  return useRef({ value: 0 });
}

export function bindScrollTriggerProgress(
  ref: ProgressRef,
  onUpdate?: (value: number) => void
) {
  return (self: { progress: number }) => {
    ref.current.value = self.progress;
    onUpdate?.(self.progress);
  };
}
