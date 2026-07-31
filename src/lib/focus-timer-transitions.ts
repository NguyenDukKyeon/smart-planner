import type { StoredTimerState } from "./focus-timer-store";

/**
 * Computes the local-only state shown when a non-owner tab observes natural
 * expiry. It deliberately does not persist; only the lock owner may commit the
 * terminal timer transition.
 */
export function createNonOwnerExpiryLocalState(
  timerState: StoredTimerState,
  elapsedSeconds: number,
): StoredTimerState {
  return {
    ...timerState,
    isRunning: false,
    startTimestamp: null,
    accumulatedSeconds: Math.min(
      timerState.durationMinutes * 60,
      Math.max(timerState.accumulatedSeconds, elapsedSeconds),
    ),
    status: "paused",
  };
}
