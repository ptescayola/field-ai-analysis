/** Rough 7-day precipitation normal (mm) for humid Atlantic latitudes (~40–44°N). */
const MARITIME_7D_RAIN_MM_BY_MONTH: Record<number, number> = {
  1: 48,
  2: 40,
  3: 38,
  4: 32,
  5: 28,
  6: 18,
  7: 12,
  8: 16,
  9: 28,
  10: 45,
  11: 52,
  12: 55,
}

/**
 * Approximate rainfall that typically falls in a 7-day window around `when`
 * for the field latitude. Placeholder until climate normals are wired in.
 */
export function approxExpectedRainNext7DaysMm(
  latitude: number,
  when: Date = new Date(),
): number {
  const month = when.getMonth() + 1
  const base = MARITIME_7D_RAIN_MM_BY_MONTH[month] ?? 30
  const latFactor = latitude >= 41 ? 1 : latitude >= 38 ? 0.85 : 0.72
  return Math.round(base * latFactor)
}
