export function getGoogleDrawingsEditURL(drawingID: string) {
  return `https://docs.google.com/drawings/d/${drawingID}/edit`;
}
export function getGoogleDrawingsPreviewURL(drawingID: string) {
  return `https://docs.google.com/drawings/d/${drawingID}/preview`;
}
export function extractDrawingID(urlOrID: string | null): string | null {
  if (!urlOrID) return null;
  if (urlOrID.startsWith("https://drive.google.com/open?id=")) {
    return urlOrID.split("https://drive.google.com/open?id=")[1];
  }
  if (urlOrID.startsWith("https://docs.google.com/drawings/d/")) {
    return urlOrID.split("https://docs.google.com/drawings/d/")[1].split("/")[0];
  }
  return urlOrID;
}
