const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    throw new Error(
      `Invalid duration format: "${value}". Expected e.g. "15m", "7d".`,
    );
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit];
}

export function parseDurationSeconds(value: string): number {
  return Math.floor(parseDurationMs(value) / 1000);
}
