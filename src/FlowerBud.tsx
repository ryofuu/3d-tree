type Props = {
  scale?: number;
};

/**
 * 閉じたつぼみ。縦長の花びら塊 + 先端に花弁のヒント + 根元を包む萼（がく）。
 * 原点が茎の接続点。
 */
export function FlowerBud({ scale = 1 }: Props) {
  const SEPAL_COUNT = 5;
  const PETAL_HINT_COUNT = 6;

  return (
    <group scale={scale}>
      {/* 本体：縦長の涙型（スケールで引き伸ばした球） */}
      <mesh
        position={[0, 0.18, 0]}
        scale={[0.85, 1.4, 0.85]}
        castShadow
      >
        <sphereGeometry args={[0.1, 22, 22]} />
        <meshStandardMaterial color="#d94d8a" roughness={0.5} />
      </mesh>

      {/* 花びらのヒント（外側に縦リブとして少しだけ覗く色違いの細長い球） */}
      {Array.from({ length: PETAL_HINT_COUNT }).map((_, i) => {
        const angle = (i / PETAL_HINT_COUNT) * Math.PI * 2;
        return (
          <group key={`hint-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0.075, 0.2, 0]}
              scale={[0.22, 1.5, 0.22]}
              rotation={[0, 0, -0.05]}
              castShadow
            >
              <sphereGeometry args={[0.05, 14, 14]} />
              <meshStandardMaterial color="#e86ba4" roughness={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* 先端のすぼんだとがり */}
      <mesh position={[0, 0.33, 0]} castShadow>
        <coneGeometry args={[0.04, 0.08, 10]} />
        <meshStandardMaterial color="#c43a7a" roughness={0.5} />
      </mesh>

      {/* 萼（がく）：緑の小さな葉が根元を包む */}
      {Array.from({ length: SEPAL_COUNT }).map((_, i) => {
        const angle = (i / SEPAL_COUNT) * Math.PI * 2;
        return (
          <group key={`sep-${i}`} rotation={[0, angle, 0]}>
            <mesh
              position={[0.06, 0.08, 0]}
              rotation={[0, 0, -0.5]}
              scale={[0.45, 1, 0.45]}
              castShadow
            >
              <coneGeometry args={[0.05, 0.18, 10]} />
              <meshStandardMaterial color="#4a8c3a" roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
