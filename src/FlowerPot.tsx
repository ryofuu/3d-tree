/**
 * 素焼き風の植木鉢。鉢本体（截頭円錐）+ 上端のリム + 上面の土。
 * 上面の高さは {@link POT_TOP_Y}。花の position[1] にこの値を入れれば茎が土から生える。
 */
const POT_HEIGHT = 0.45;
const POT_TOP_R = 0.45;
const POT_BOTTOM_R = 0.32;
const RIM_THICKNESS = 0.07;
const RIM_OVERHANG = 0.04;

export const POT_TOP_Y = POT_HEIGHT;

type Props = {
  position?: [number, number, number];
  /** テラコッタ以外を使いたい時用（例：白磁、青陶器） */
  bodyColor?: string;
  rimColor?: string;
};

export function FlowerPot({
  position = [0, 0, 0],
  bodyColor = "#b85638",
  rimColor = "#9a4128",
}: Props) {
  return (
    <group position={position}>
      {/* 鉢本体（上が広い截頭円錐） */}
      <mesh position={[0, POT_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[POT_TOP_R, POT_BOTTOM_R, POT_HEIGHT, 28]}
        />
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </mesh>
      {/* 上端の張り出しリム */}
      <mesh
        position={[0, POT_HEIGHT - RIM_THICKNESS / 2, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            POT_TOP_R + RIM_OVERHANG,
            POT_TOP_R + RIM_OVERHANG,
            RIM_THICKNESS,
            28,
          ]}
        />
        <meshStandardMaterial color={rimColor} roughness={0.85} />
      </mesh>
      {/* 上面の土 */}
      <mesh position={[0, POT_HEIGHT - 0.005, 0]} receiveShadow>
        <cylinderGeometry
          args={[POT_TOP_R - 0.02, POT_TOP_R - 0.02, 0.02, 28]}
        />
        <meshStandardMaterial color="#3a2618" roughness={0.95} />
      </mesh>
    </group>
  );
}
