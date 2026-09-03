const SAFE_JSON_FILE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.json$/;

export function isValidFieldFile(fileName: string): boolean {
  return SAFE_JSON_FILE_NAME.test(fileName);
}
