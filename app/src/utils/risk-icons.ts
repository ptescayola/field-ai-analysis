const RISK_ICON_KEYS = [
  "water_stress",
  "disease",
  "nutrient_deficiency",
  "extreme_weather",
  "vegetation_degradation",
  "root_zone_limitation",
] as const

export type RiskIconKey = (typeof RISK_ICON_KEYS)[number]

function normalizeRiskType(riskType: string): string {
  return riskType.trim().toLowerCase().replaceAll(" ", "_")
}

const RISK_TYPE_ALIASES: Record<string, RiskIconKey> = {
  root_zone_limitation: "root_zone_limitation",
  root_zone_limit: "root_zone_limitation",
  rooting_depth_limitation: "root_zone_limitation",
  shallow_root_zone: "root_zone_limitation",
}

export function riskIconKey(riskType: string): RiskIconKey | undefined {
  const key = normalizeRiskType(riskType)
  const alias = RISK_TYPE_ALIASES[key]
  if (alias) return alias

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
