export type FlowerStage = "seed" | "sprout" | "growth" | "bud" | "bloom";

export type FlowerStageConfig = {
  label: string;
  stemHeight: number;
  stemRadius: number;
  leafCount: number;
  /** 茎のどの高さから葉が生え始めるか (0-1) */
  leafStartRatio: number;
  topPart: "seed" | "cotyledons" | "none" | "bud" | "bloom";
  petalColors: string[];
};

export const FLOWER_STAGES: Record<FlowerStage, FlowerStageConfig> = {
  seed: {
    label: "種",
    stemHeight: 0,
    stemRadius: 0,
    leafCount: 0,
    leafStartRatio: 0,
    topPart: "seed",
    petalColors: [],
  },
  sprout: {
    label: "発芽",
    stemHeight: 0.15,
    stemRadius: 0.012,
    leafCount: 0,
    leafStartRatio: 0,
    topPart: "cotyledons",
    petalColors: [],
  },
  growth: {
    label: "茎伸長",
    stemHeight: 0.95,
    stemRadius: 0.022,
    leafCount: 2,
    leafStartRatio: 0.3,
    topPart: "none",
    petalColors: [],
  },
  bud: {
    label: "つぼみ",
    stemHeight: 1.7,
    stemRadius: 0.028,
    leafCount: 3,
    leafStartRatio: 0.2,
    topPart: "bud",
    petalColors: [],
  },
  bloom: {
    label: "開花",
    stemHeight: 2.0,
    stemRadius: 0.032,
    leafCount: 3,
    leafStartRatio: 0.18,
    topPart: "bloom",
    petalColors: ["#ff6b9d", "#ff85b0", "#ff5a8d", "#ffa3c2"],
  },
};

export const FLOWER_STAGE_ORDER: FlowerStage[] = [
  "seed",
  "sprout",
  "growth",
  "bud",
  "bloom",
];
