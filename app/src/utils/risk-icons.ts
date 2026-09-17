const RISK_ICON_KEYS = [
  "water_stress",
  "disease",
  "nutrient_deficiency",
  "extreme_weather",
  "vegetation_degradation",
] as const

export type RiskIconKey = (typeof RISK_ICON_KEYS)[number]

function normalizeRiskType(riskType: string): string {
  return riskType.trim().toLowerCase().replaceAll(" ", "_")
}

export function riskIconKey(riskType: string): RiskIconKey | undefined {
  const key = normalizeRiskType(riskType)
  if (RISK_ICON_KEYS.includes(key as RiskIconKey)) {
    return key as RiskIconKey
  }

  const match = RISK_ICON_KEYS.find(
    (candidate) => key.includes(candidate) || candidate.includes(key),
  )
  return match
}

export function riskIconUrl(riskType: string): string | undefined {
  const key = riskIconKey(riskType)
  if (!key) return undefined
  return `/icons/risk/${key}.png`
}
