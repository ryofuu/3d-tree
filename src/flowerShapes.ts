import { Shape } from "three";

/**
 * 花びらのシェイプ。原点(base)から +Y 方向に長さ len、±X に幅 width の涙滴型。
 * 先端をやや丸め、根元をすぼめる。
 */
export function petalShape(len: number, width: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(width, len * 0.2, width * 0.8, len * 0.85, 0, len);
  s.bezierCurveTo(-width * 0.8, len * 0.85, -width, len * 0.2, 0, 0);
  return s;
}

/**
 * 葉のシェイプ。花びらより細長く、根元は細く中央がやや膨らむ笹型。
 */
export function leafShape(len: number, width: number): Shape {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(width * 1.2, len * 0.25, width * 0.7, len * 0.75, 0, len);
  s.bezierCurveTo(-width * 0.7, len * 0.75, -width * 1.2, len * 0.25, 0, 0);
  return s;
}
