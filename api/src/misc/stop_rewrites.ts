const stopRewrites: Record<string, string> = {
  groningen: "groningen, groningen hs",
  "groningen, hoofdstation": "groningen, groningen hs",
  leeuwarden: "leeuwarden, busstation",
};

export const rewriteStopName = (name: string): string => {
  const nameLower = name.toLowerCase();
  return stopRewrites[nameLower] || name;
};
