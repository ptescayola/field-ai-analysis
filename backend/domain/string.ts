export function underscoreToSpaces(value: string): string {
  return value.replaceAll("_", " ")
}

export function normalizeUnderscoreKey(value: string): string {
  return value.trim().toLowerCase().replaceAll("_", " ")
}

export function formatLabel(value: string): string {
  return underscoreToSpaces(value).replace(/\b\w/g, (char) =>
    char.toUpperCase(),
  )
}
