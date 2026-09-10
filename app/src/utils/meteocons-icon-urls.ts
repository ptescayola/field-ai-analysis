const METEOCONS_ICON_MODULES = import.meta.glob<string>(
  "../assets/meteocons/*.svg",
  { eager: true, query: "?url", import: "default" },
);

function slugFromIconPath(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1, -".svg".length);
}

/** Meteocons flat icon URLs keyed by slug (from synced assets). */
export const METEOCONS_ICON_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(METEOCONS_ICON_MODULES).map(([path, url]) => [
    slugFromIconPath(path),
    url,
  ]),
);
