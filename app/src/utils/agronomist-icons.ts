const AGRONOMIST_ICON_KEYS = [
  "irrigation",
  "stress",
  "development",
  "health",
] as const

export type AgronomistIconKey = (typeof AGRONOMIST_ICON_KEYS)[number]

function normalizeFacetId(facetId: string): string {
  return facetId.trim().toLowerCase().replaceAll(" ", "_")
}

export function agronomistIconKey(
  facetId: string,
): AgronomistIconKey | undefined {
  const key = normalizeFacetId(facetId)
  if (AGRONOMIST_ICON_KEYS.includes(key as AgronomistIconKey)) {
    return key as AgronomistIconKey
  }
  return undefined
}

export function agronomistIconUrl(facetId: string): string | undefined {
  const key = agronomistIconKey(facetId)
  if (!key) return undefined
  return `/icons/agronomist/${key}.png`
}
