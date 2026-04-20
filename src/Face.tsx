type FaceProps = {
  /** 顔全体のスケール。1.0 が基準 */
  scale: number;
  /** ほっぺを付けるか（桜用） */
  withBlush?: boolean;
};

/**
 * 木の顔パーツ。原点が顔の中心になるよう配置されているので、
 * 親 group で表示したい位置（クラウン正面など）に移動させて使う。
 * +z 方向を向いて描画される。
 */
export function Face({ scale, withBlush = false }: FaceProps) {
  const eyeR = 0.13 * scale;
  const pupilR = 0.06 * scale;
  const eyeDX = 0.22 * scale;
  const eyeY = 0.05 * scale;
  const mouthY = -0.22 * scale;
  const mouthR = 0.15 * scale;
  const mouthTube = 0.025 * scale;

  return (
    <group>
      {/* 目 */}
      {[-eyeDX, eyeDX].map((x, i) => (
        <group key={i} position={[x, eyeY, 0]}>
          {/* 白目 */}
          <mesh>
            <sphereGeometry args={[eyeR, 24, 24]} />
            <meshStandardMaterial color="#fdfdfd" roughness={0.25} />
          </mesh>
          {/* 瞳 */}
          <mesh position={[0.015 * scale, -0.01 * scale, eyeR * 0.82]}>
            <sphereGeometry args={[pupilR, 16, 16]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
          {/* ハイライト */}
          <mesh
            position={[0.04 * scale, 0.03 * scale, eyeR * 0.88]}
          >
            <sphereGeometry args={[pupilR * 0.35, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* 口（スマイル：半トーラスを180°回して∪形に） */}
      <mesh position={[0, mouthY, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[mouthR, mouthTube, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#3a2018" roughness={0.5} />
      </mesh>

      {/* ほっぺ */}
      {withBlush &&
        [-0.35, 0.35].map((x, i) => (
          <mesh
            key={`blush-${i}`}
            position={[x * scale, -0.1 * scale, 0.02 * scale]}
          >
            <sphereGeometry args={[0.08 * scale, 14, 14]} />
            <meshStandardMaterial
              color="#ff8fb0"
              transparent
              opacity={0.65}
            />
          </mesh>
        ))}
    </group>
  );
}
