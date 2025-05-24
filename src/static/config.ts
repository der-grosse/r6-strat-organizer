const config = {
  disabledFeatures: (() => {
    const disabledFeatures = process.env.NEXT_PUBLIC_DISABLED_FEATURES;
    if (!disabledFeatures) return [];
    return disabledFeatures.split(",").map((feature) => feature.trim());
  })() as ("editor" | "create-strat")[],
} as const;

export default config;
