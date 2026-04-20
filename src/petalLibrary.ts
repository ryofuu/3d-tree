import { Shape } from "three";

/**
 * ガーベラ／デイジー向け：先端が丸く広い、わずかに括れのある花びら。
 * 原点を根元、+Y 方向に長さ len。
 */
export function gerberaPetal(len: number, w: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 0.6, len * 0.1, w * 1.0, len * 0.55, w * 0.85, len * 0.95);
  s.bezierCurveTo(w * 0.35, len * 1.05, -w * 0.35, len * 1.05, -w * 0.85, len * 0.95);
  s.bezierCurveTo(-w * 1.0, len * 0.55, -w * 0.6, len * 0.1, 0, 0);
  return s;
}

/**
 * チューリップ向け：根元はやや膨らみ、先端が尖る涙型。
 */
export function tulipPetal(len: number, w: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 1.0, len * 0.35, w * 0.65, len * 0.85, 0, len);
  s.bezierCurveTo(-w * 0.65, len * 0.85, -w * 1.0, len * 0.35, 0, 0);
  return s;
}

/**
 * ユリ向け：細長くて先端が尖り、中央が膨らむ。後ろに反る形。
 */
export function lilyPetal(len: number, w: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 0.45, len * 0.15, w * 0.95, len * 0.55, w * 0.55, len * 0.88);
  s.quadraticCurveTo(0, len * 1.05, -w * 0.55, len * 0.88);
  s.bezierCurveTo(-w * 0.95, len * 0.55, -w * 0.45, len * 0.15, 0, 0);
  return s;
}

/**
 * バラ向け：幅広でハート型に近く、先端中央に浅い切れ込みがある。
 */
export function rosePetal(size: number): Shape {
  const s = new Shape();
  const w = size * 0.85;
  const len = size;
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 0.55, 0, w * 1.1, len * 0.55, w * 0.4, len);
  s.quadraticCurveTo(w * 0.15, len * 0.92, 0, len * 0.86);
  s.quadraticCurveTo(-w * 0.15, len * 0.92, -w * 0.4, len);
  s.bezierCurveTo(-w * 1.1, len * 0.55, -w * 0.55, 0, 0, 0);
  return s;
}

/**
 * サクラ向け：幅広で先端中央に深いV字の切れ込み（八重桜の単花弁にも使える）。
 */
export function cherryPetal(len: number, w: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 0.7, len * 0.05, w * 1.0, len * 0.55, w * 0.7, len * 0.92);
  s.quadraticCurveTo(w * 0.35, len * 0.78, 0, len * 0.7);
  s.quadraticCurveTo(-w * 0.35, len * 0.78, -w * 0.7, len * 0.92);
  s.bezierCurveTo(-w * 1.0, len * 0.55, -w * 0.7, len * 0.05, 0, 0);
  return s;
}

/**
 * 細長い笹型の葉：チューリップ・ユリ向け。
 */
export function swordLeaf(len: number, w: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 1.4, len * 0.2, w * 0.7, len * 0.75, 0, len);
  s.bezierCurveTo(-w * 0.7, len * 0.75, -w * 1.4, len * 0.2, 0, 0);
  return s;
}

/**
 * 幅広の卵形の葉：ガーベラ・バラ向け。
 */
export function ovateLeaf(len: number, w: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 1.2, len * 0.25, w * 0.9, len * 0.7, 0, len);
  s.bezierCurveTo(-w * 0.9, len * 0.7, -w * 1.2, len * 0.25, 0, 0);
  return s;
}

/**
 * 鋭い鋸歯付きの花弁：禍々しい炎の花向け。
 * 根元から先端へ向けてギザギザの縁を持ち、先端は鋭く尖る。
 */
export function spikyPetal(len: number, w: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  // 右側のギザギザ
  s.lineTo(w * 0.6, len * 0.15);
  s.lineTo(w * 0.35, len * 0.28);
  s.lineTo(w * 0.8, len * 0.42);
  s.lineTo(w * 0.4, len * 0.55);
  s.lineTo(w * 0.7, len * 0.7);
  s.lineTo(w * 0.3, len * 0.82);
  s.lineTo(w * 0.4, len * 0.92);
  // 鋭い先端
  s.lineTo(0, len * 1.05);
  // 左側（対称）
  s.lineTo(-w * 0.4, len * 0.92);
  s.lineTo(-w * 0.3, len * 0.82);
  s.lineTo(-w * 0.7, len * 0.7);
  s.lineTo(-w * 0.4, len * 0.55);
  s.lineTo(-w * 0.8, len * 0.42);
  s.lineTo(-w * 0.35, len * 0.28);
  s.lineTo(-w * 0.6, len * 0.15);
  s.lineTo(0, 0);
  return s;
}

/**
 * 細長く蛇行する触手状の花弁：邪眼花・深海花向け。
 * S字にうねりながら先端へ向けて細くなる。
 */
export function tendrilPetal(len: number, w: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(w * 1.1, len * 0.1, w * 0.5, len * 0.35, w * 0.8, len * 0.55);
  s.bezierCurveTo(w * 0.4, len * 0.78, w * 0.25, len * 0.9, 0, len);
  s.bezierCurveTo(-w * 0.25, len * 0.9, -w * 0.4, len * 0.78, -w * 0.8, len * 0.55);
  s.bezierCurveTo(-w * 0.5, len * 0.35, -w * 1.1, len * 0.1, 0, 0);
  return s;
}

/**
 * 菱形（ダイヤモンド）の花弁：水晶花向け。
 * 幅の最大は中央やや上、先端は鋭角。
 */
export function diamondPetal(len: number, w: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.lineTo(w * 0.55, len * 0.2);
  s.lineTo(w, len * 0.55);
  s.lineTo(w * 0.3, len * 0.88);
  s.lineTo(0, len);
  s.lineTo(-w * 0.3, len * 0.88);
  s.lineTo(-w, len * 0.55);
  s.lineTo(-w * 0.55, len * 0.2);
  s.lineTo(0, 0);
  return s;
}
