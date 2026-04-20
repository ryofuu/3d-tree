import type { Stage } from "./stages";

export type CuteStageConfig = {
  label: string;
  height: number;
  /** メインとなる大玉クラスタの数 */
  mainCount: number;
  /** 各大玉に付着させる小さなサーフェスバンプの個数 */
  bumpsPerMain: number;
  leafColors: string[];
  trunkColor: string;
  leafRadiusFactor: number;
  faceScale: number;
  mood: "happy" | "blushing";
};

export const CUTE_STAGES: Record<Stage, CuteStageConfig> = {
  seedling: {
    label: "苗",
    height: 0.55,
    mainCount: 1,
    bumpsPerMain: 4,
    leafColors: ["#b4e08a", "#9ed074"],
    trunkColor: "#8a6b3e",
    leafRadiusFactor: 3.2,
    faceScale: 0.5,
    mood: "happy",
  },
  sapling: {
    label: "若木",
    height: 1.5,
    mainCount: 4,
    bumpsPerMain: 5,
    leafColors: ["#7ec25d", "#93d070"],
    trunkColor: "#7a5532",
    leafRadiusFactor: 1.5,
    faceScale: 0.75,
    mood: "happy",
  },
  young: {
    label: "成長中",
    height: 2.5,
    mainCount: 6,
    bumpsPerMain: 5,
    leafColors: ["#5eab4a", "#6fc057", "#4f9240"],
    trunkColor: "#6b4a2b",
    leafRadiusFactor: 1.25,
    faceScale: 1.0,
    mood: "happy",
  },
  mature: {
    label: "成木",
    height: 3.6,
    mainCount: 8,
    bumpsPerMain: 6,
    leafColors: ["#4a9440", "#5eab4a", "#3c8035"],
    trunkColor: "#5a3a22",
    leafRadiusFactor: 1.2,
    faceScale: 1.2,
    mood: "happy",
  },
  bloom: {
    label: "桜",
    height: 3.6,
    mainCount: 8,
    bumpsPerMain: 6,
    leafColors: ["#ffb3cf", "#ffc8db", "#ffa3c2", "#ff94b5"],
    trunkColor: "#4a2e1c",
    leafRadiusFactor: 1.25,
    faceScale: 1.2,
    mood: "blushing",
  },
};
