/** Served from app/public/examples/ — filenames must match parseCoordinatesFromFilename. */
export const IMAGE_ANALYSIS_EXAMPLES = [
  {
    fileName: "39.060664,1.397765.png",
    label: "39.060664, 1.397765 (PNG)",
  },
  {
    fileName: "38.989428,1.341149.png",
    label: "38.989428, 1.341149 (PNG)",
  },
  {
    fileName: "39.057343,1.395050.jpg",
    label: "39.057343, 1.395050 (JPEG)",
  },
] as const

export function exampleImageUrl(fileName: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}examples/${encodeURIComponent(fileName)}`
}
