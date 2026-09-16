/** Adequate volumetric moisture band by soil texture (agronomist reference). */
export type SoilMoistureRange = {
  min: number
  max: number
}

const ADEQUATE_BY_TEXTURE: Record<string, SoilMoistureRange> = {
  sandy: { min: 9, max: 14 },
  sandy_loam: { min: 14, max: 22 },
  loam: { min: 20, max: 30 },
  calcareous_loam: { min: 20, max: 30 },
  clay_loam: { min: 26, max: 37 },
  clay: { min: 32, max: 44 },
}

function normalizeSoilType(soilType: string): string {
  return soilType.trim().toLowerCase().replaceAll(" ", "_")
}

export function getSoilMoistureAdequateRange(
  soilType: string,
): SoilMoistureRange {
  const key = normalizeSoilType(soilType)
  return ADEQUATE_BY_TEXTURE[key] ?? ADEQUATE_BY_TEXTURE.loam
}

export function formatMoistureRecommendedFooter(
  currentPercent: number,
  range: SoilMoistureRange,
): string {
  if (currentPercent < range.min) {
    const gap = Math.round(range.min - currentPercent)
    return `Recommended ↓ ${gap}%`
  }
  if (currentPercent > range.max) {
    const gap = Math.round(currentPercent - range.max)
    return `Recommended ↑ ${gap}%`
  }
  return "Recommended ✓"
}
