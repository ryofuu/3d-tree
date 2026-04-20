export type Stage = "seedling" | "sapling" | "young" | "mature" | "bloom";

export type StageConfig = {
  label: string;
  /** 木全体のおおよその高さ */
  height: number;
  /** 葉の塊の数 */
  leafCount: number;
  /** 葉の色パレット。複数あれば葉ごとにランダム選択 */
  leafColors: string[];
  /** 幹の色 */
  trunkColor: string;
  /** 葉のサイズ倍率。苗は相対的に大きな葉にするなど */
  leafRadiusFactor: number;
};

export const STAGES: Record<Stage, StageConfig> = {
  seedling: {
    label: "苗",
    height: 0.4,
    leafCount: 3,
    leafColors: ["#9ed884"],
    trunkColor: "#7a5a3a",
    leafRadiusFactor: 2.2,
  },
  sapling: {
    label: "若木",
    height: 1.5,
    leafCount: 10,
    leafColors: ["#6aaf56"],
    trunkColor: "#6b4a2b",
    leafRadiusFactor: 1.1,
  },
  young: {
    label: "成長中",
    height: 2.7,
    leafCount: 22,
    leafColors: ["#4f9643"],
    trunkColor: "#624028",
    leafRadiusFactor: 1.0,
  },
  mature: {
    label: "成木",
    height: 4,
    leafCount: 40,
    leafColors: ["#3f7d3f"],
    trunkColor: "#5a3a22",
    leafRadiusFactor: 1.0,
  },
  bloom: {
    label: "桜",
    height: 4,
    leafCount: 55,
    leafColors: ["#f6b5cf", "#fcc9da", "#f0a7c2", "#ffd9e4"],
    trunkColor: "#4a2e1c",
    leafRadiusFactor: 1.1,
  },
};

export const STAGE_ORDER: Stage[] = [
  "seedling",
  "sapling",
  "young",
  "mature",
  "bloom",
];
