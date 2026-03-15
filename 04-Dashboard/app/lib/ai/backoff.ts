// GPO Backoff — Exponential backoff with jitter for parse retry

export interface BackoffArgs {
  baseMs: number;
  multiplier: number;
  jitter: number;
  attempt: number;
}

/**
 * Compute backoff delay in milliseconds.
 * Formula: baseMs * multiplier^(attempt-1) * (1 +/- jitter)
 */
export function computeBackoffMs(args: BackoffArgs): number {
  const { baseMs, multiplier, jitter, attempt } = args;
  const base = baseMs * Math.pow(multiplier, Math.max(0, attempt - 1));
  const jitterFactor = 1 + (Math.random() * 2 - 1) * jitter;
  return Math.max(0, Math.round(base * jitterFactor));
}

/**
 * Deterministic version for testing (no randomness).
 */
export function computeBackoffMsDeterministic(args: BackoffArgs): number {
  const { baseMs, multiplier, attempt } = args;
  return Math.round(baseMs * Math.pow(multiplier, Math.max(0, attempt - 1)));
}

/**
 * Non-blocking sleep using setTimeout.
 */
export function sleepMs(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { computeBackoffMs, computeBackoffMsDeterministic, sleepMs };
