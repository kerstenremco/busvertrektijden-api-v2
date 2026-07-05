type StopRewrite = {
  from: string[];
  to: string[];
};

const stopRewrites: StopRewrite[] = [
  // Groningen hoofdstation
  {
    from: ["groningen", "groningen, hoofdstation"],
    to: [
      "Groningen, Hoofdstation (Perron A oostzijde)",
      "Groningen, Hoofdstation (Perron A westzijde)",
      "Groningen, Hoofdstation (Perron B oostzijde)",
      "Groningen, Hoofdstation (Perron B westzijde)",
    ],
  },
  // Leeuwarden
  {
    from: ["leeuwarden"],
    to: ["leeuwarden, busstation"],
  },
  // Weert
  {
    from: ["weert", "weert, station", "weert, station weert"],
    to: ["weert, station", "weert, station weert"],
  },
];

export const rewriteStopName = (name: string): string[] => {
  // Search rewrite
  const rewrite = stopRewrites.find((rewrite) => rewrite.from.some((from) => from.toLowerCase() === name.toLowerCase()));
  return rewrite ? rewrite.to : [name];
};
