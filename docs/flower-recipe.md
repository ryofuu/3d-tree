# 花の作り方レシピ（花図鑑の 4 品種を再現する）

R3F で「ガーベラ／チューリップ／ユリ／バラ」のような作り込んだ花を procedural に作るためのノウハウ集。
`src/Gerbera/Tulip/Lily/RoseFlower.tsx` の設計思想を後から追体験できるようにする。

---

## 1. 設計思想

### 1.1 ステージ分割＝データ、造形＝分岐

ひとつの花を 5 段階に分ける。**ステージは状態**。造形コードは状態で if 分岐する。

```
1. 蕾（つぼみ）       — 閉じている。萼＋色の塊
2. ほころび          — 先端が少し開き、花びらの一部が覗く
3. 満開（普通の花）  — ここで既に満足できる典型形
4. 豪華              — ステージ3に二重花びらなどの増築
5. 特別              — 発光・浮遊・装飾で非現実的な美しさ
```

重要な原則：**ステージ 3 の時点で既に「その花」として完成している**こと。  
5 段階目まで待たないと嬉しくない作りにしない。

### 1.2 花頭のみ差し替える

茎・葉・萼は全ステージ共通。花頭（先端部）だけステージで切り替える。

```tsx
export function XxxFlower({ stage, position }) {
  return (
    <group position={position}>
      {/* 茎・葉・萼はステージ非依存で共通 */}
      <StemWithLeaves />
      <group position={[0, STEM_HEIGHT, 0]}>
        {stage === 1 && <Bud />}
        {stage === 2 && <Opening />}
        {stage === 3 && <Bloom />}
        {stage === 4 && <Rich />}
        {stage === 5 && <Spectacular />}
      </group>
    </group>
  );
}
```

---

## 2. 花びらは `THREE.Shape` + `ExtrudeGeometry`

### 2.1 なぜ Shape か

球を潰して花びらに見せる方式は、枚数が増えるとシルエットが単調になる。
花の個性は花びら輪郭で決まる。`Shape` で 2D 輪郭を描き、`ExtrudeGeometry` で厚みとベベルを付けると、花びららしい面と縁が出る。

### 2.2 典型的な 4 種の輪郭

`src/petalLibrary.ts` にライブラリ化してある。

```ts
// ガーベラ：先端がやや広い丸い舌状
gerberaPetal(len, w) {
  moveTo(0, 0);
  bezierCurveTo(w*0.6, len*0.1, w, len*0.55, w*0.85, len*0.95);
  bezierCurveTo(w*0.35, len*1.05, -w*0.35, len*1.05, -w*0.85, len*0.95);
  bezierCurveTo(-w, len*0.55, -w*0.6, len*0.1, 0, 0);
}

// チューリップ：尖った涙型
tulipPetal(len, w) {
  moveTo(0, 0);
  bezierCurveTo(w, len*0.35, w*0.65, len*0.85, 0, len);
  bezierCurveTo(-w*0.65, len*0.85, -w, len*0.35, 0, 0);
}

// ユリ：中央が膨らみ先端が鋭い、反り返り前提の細長い形
lilyPetal(len, w) {
  moveTo(0, 0);
  bezierCurveTo(w*0.45, len*0.15, w*0.95, len*0.55, w*0.55, len*0.88);
  quadraticCurveTo(0, len*1.05, -w*0.55, len*0.88);
  bezierCurveTo(-w*0.95, len*0.55, -w*0.45, len*0.15, 0, 0);
}

// バラ：幅広でハート型、先端中央に浅い切れ込み
rosePetal(size) {
  moveTo(0, 0);
  bezierCurveTo(w*0.55, 0, w*1.1, len*0.55, w*0.4, len);
  quadraticCurveTo(w*0.15, len*0.92, 0, len*0.86);   // ← ハートの切れ込み
  quadraticCurveTo(-w*0.15, len*0.92, -w*0.4, len);
  bezierCurveTo(-w*1.1, len*0.55, -w*0.55, 0, 0, 0);
}
```

### 2.3 Extrude 設定の目安

薄い花びらには depth 0.012〜0.025、ベベルで縁に柔らかさを出す。

```ts
const petalExtrude = {
  depth: 0.02,
  bevelEnabled: true,
  bevelSegments: 2,      // ベベルの滑らかさ
  steps: 1,
  bevelSize: 0.01,       // 外側への膨らみ
  bevelThickness: 0.006, // 厚み方向の膨らみ
};
```

葉はさらに薄く：`depth: 0.008〜0.012`。

### 2.4 両面表示とトーンマッピング

薄い花びらは裏から見ても描画する必要がある。`DoubleSide` 必須。

```tsx
<meshStandardMaterial
  color={petalColor}
  roughness={0.4}
  side={DoubleSide}
  toneMapped={emissiveIntensity > 0.5 ? false : true}  // Bloom に通すときは false
/>
```

---

## 3. 花頭の組み立て：`PetalRing` パターン

円周上に花びらを並べる基本動作を関数化する。

```tsx
function PetalRing({ count, radius, outwardLean, y, size, color, angleOffset = 0 }) {
  const shape = useMemo(() => rosePetal(size), [size]);
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 + angleOffset;
    return (
      <group key={i} rotation={[0, angle, 0]}>
        <mesh
          position={[radius, y, 0]}
          rotation={[0, 0, -outwardLean]}
          castShadow
        >
          <extrudeGeometry args={[shape, petalExtrude]} />
          <meshStandardMaterial color={color} side={DoubleSide} />
        </mesh>
      </group>
    );
  });
}
```

### 3.1 座標の決め方

**外側の `<group rotation={[0, angle, 0]}>` が花びらを円周に配置**。
内側の mesh は **「+X 方向が外向き」** の前提で組む。

- `position=[radius, y, 0]` で中心から外に `radius`、上に `y`
- `rotation=[0, 0, -outwardLean]` で花びらを外向きに倒す
  - `outwardLean = 0` ⇒ 花びらは垂直に立つ
  - `outwardLean = π/2` ⇒ 花びらは水平に倒れる
  - 負の値で内向きに倒れる（バラの内側ペタル）

### 3.2 シェイプの向き

`Shape` は XY 平面に描き、`+Y` が花びらの長さ方向。`ExtrudeGeometry` は +Z 方向に厚みをつける。
→ デフォルトで「花びらが垂直に立っている」状態になる。`outwardLean` で倒して使う。

### 3.3 リングをずらして層を作る

- 輪の数を変える（5, 8, 10, ...）
- `angleOffset` で隣接リング間を半ステップずらす（`Math.PI / count`）
- `outwardLean` を内→外で徐々に大きく（0.1 → 1.5 くらいまで）

---

## 4. ステージ 5 段階のレシピ

どの花でも共通で使えるテンプレート。

### ステージ 1：蕾（Bud）

- 閉じた塊を 1〜2 個のスケールされた球で作る
  - `scale={[0.7, 1.4, 0.7]}` で縦長
- **5〜6 個の萼**を `coneGeometry` で根元を包むように配置
  - `rotation={[0, 0, -0.6]}` 程度で外倒し、`scale={[0.4, 1, 0.4]}` で細身
- 先端の尖りを `coneGeometry` で追加

### ステージ 2：ほころび（Opening）

- ステージ 1 より少し大きく、花びらの端が見え始める
- 花びら一部（6〜8 枚）を鋭い角度（`-Math.PI/2 + 0.95`）で上向きに挿す
- 萼は `openAngle` でやや外側に開く

### ステージ 3：満開（Bloom）— ここが主役

- そのフラワーの基本形を完成させる
- **花びらの枚数目安**
  - ガーベラ：16 枚（放射状）
  - チューリップ：6 枚（カップ）
  - ユリ：6 枚（反り返り）
  - バラ：4 リングの螺旋
- 花芯（黄色ドームや中央の柱）を付ける
- おしべを `Stamens` で散らす（30〜60 個）

### ステージ 4：豪華（Rich）

- **外リングと内リングの二重**にする
  - 外：ステージ 3 と同じかやや大きい
  - 内：小さめで、半ステップ回転ずらし、`y` を少し持ち上げ、`outwardLean` を控えめに（より立つ）
- 花芯も一回り大きく、おしべの数も増やす

### ステージ 5：特別（Spectacular）

- **三重花びら**または外側リングを追加
- `emissive` と `emissiveIntensity` を全体に入れる（0.3〜0.5 が目安）
- `toneMapped={false}` を併用して Bloom に通す
- 花芯を強発光化（`emissiveIntensity={1.4}` 以上）
- **装飾を散らす**
  - 発光ドット（小さな球、emissive 2〜2.5）
  - 浮遊花びら（`floatingPetals` 配列で乱数位置）
  - 金色の露や花粉粒

---

## 5. 花芯・おしべのディテール

### 5.1 花芯ドーム

平らな円盤より、半球をわずかに顔を出させるのが自然。

```tsx
<sphereGeometry
  args={[radius, 28, 28, 0, Math.PI * 2, 0, Math.PI / 2.2]}
/>
```

最後の 2 引数で「上半分だけ」を作る。`Math.PI / 2.2` で半球より少し浅い。

### 5.2 おしべ分布（`Stamens`）

- 中心からの距離は `Math.sqrt(rand()) * centerR * 0.85`（平方根を取ることで円盤上で均等分布）
- 角度はランダム
- ドーム形状なら `y = Math.sqrt(centerR² - r²) * 0.45` で半球面に貼り付く
- 色を 2 色ランダムに振り分けると表情が出る

### 5.3 ユリ・チューリップのおしべ

ユリは花糸が長くて曲がっている。`Stamen` コンポーネントで「基部垂直円柱＋上部傾斜円柱＋先端の葯」の 3 段構成。

---

## 6. 品種特有のテクニック

### 6.1 ユリの反り返り花びら

花びらは単純に外向きに倒すのではなく、**根元で少し外倒し、先端でさらに後ろに反る**。
2 段ネストの group + mesh rotation で表現。

```tsx
<group rotation={[0, angle, 0]}>
  <group position={[0, 0, 0]} rotation={[tilt, 0, 0]}>      {/* 根元の傾き */}
    <mesh position={[0, 0.05, 0]} rotation={[-recurve, 0, 0]}>  {/* 先端の反り */}
      <extrudeGeometry args={[lilyPetal(...), ...]} />
    </mesh>
  </group>
</group>
```

### 6.2 バラの螺旋層

- 4〜6 リング、内側は小さく垂直、外側は大きく水平
- 内側リング：`outwardLean = 0.05` 近く（ほぼ垂直）
- 外側リング：`outwardLean = 1.2〜1.5`（ほぼ水平）
- 各リング間で `angleOffset = Math.PI / count` を交互に入れる

### 6.3 チューリップのカップ

6 枚しかないぶん 1 枚 1 枚を大きく、`bevelSize` を大きめに取って厚みを感じさせる。
蕾ステージは「縦長の球 + 6 方向の縦リブ」で花びらの境界を示唆する。

### 6.4 斑点・装飾

ユリの内側の斑点、バラの金ドットのように、**小さな球体を乱数位置に散らす**のが効く。
`useMemo` で seed から決定論的に生成し、レンダリング間でブレないようにする。

---

## 7. 茎と葉

### 7.1 茎

- 末広がりにする：`cylinderGeometry` の上下半径を変える（上 0.8、下 1.0）
- 高さ 1.4〜1.8 くらい。花によって変える

### 7.2 葉の付け方（品種別）

- **ガーベラ**：根生葉（ground level の放射状）
- **チューリップ**：茎を抱く 2 枚の長い葉（`swordLeaf`）
- **ユリ**：茎に沿って並ぶ細長い葉（3 段くらい）
- **バラ**：複葉（1 本の軸に 5 枚の小葉）、茎に棘も付ける

### 7.3 葉の Shape

`ovateLeaf`（幅広卵形）と `swordLeaf`（細長笹型）を使い分ける。

---

## 8. シーン組み込み

### 8.1 グリッド配置（花図鑑風）

```tsx
{VARIETIES.map((v) =>
  STAGES.map((stage, i) => {
    const x = (i - (STAGES.length - 1) / 2) * STAGE_SPACING;  // 中央揃え
    return <FlowerFor variety={v.key} stage={stage} position={[x, 0, v.z]} />;
  })
)}
```

Z を品種ごとにずらして行にし、X をステージごとにずらして列にする。

### 8.2 Bloom ポスト処理

ステージ 5 の発光を活かすため、`@react-three/postprocessing` の `Bloom` を弱めに全体に掛ける。

```tsx
<EffectComposer>
  <Bloom
    intensity={0.55}
    luminanceThreshold={0.85}  // 発光素材だけ拾う
    luminanceSmoothing={0.8}
    mipmapBlur
  />
</EffectComposer>
```

`luminanceThreshold` を高めに（0.85 前後）しないと、普通の花びらまで眩しく光ってしまう。

---

## 9. よくある落とし穴

### 9.1 花びらが片面しか見えない

→ `side={DoubleSide}` を指定。

### 9.2 ベベルが重くて光が乗らない

→ `bevelSegments` を 1〜2 に抑える。特に多重リングでは合計の GPU 負荷を考える。

### 9.3 花びらが Z 軸方向におかしく向く

→ `Shape` が XY 平面なのに、R3F の mesh にそのまま突っ込むと「花びらが +Z 方向を向いて立つ」。
`<group rotation={[0, angle, 0]}>` で円周配置してから、内側の mesh で `rotation=[0, 0, -lean]` するのが一番混乱しない。

### 9.4 乱数が毎レンダ変わる

→ `useMemo` でシードから生成する。シードは整数定数で十分。

### 9.5 発光が Bloom に拾われない

→ `toneMapped={false}` を materials に追加。`emissiveIntensity` は `> 1` で初めて Bloom に影響する目安。

### 9.6 使っていないコンポーネントを書いてしまう

→ `noUnusedLocals` で TS が叱ってくれる。`tsconfig.json` に入れておく。

---

## 10. 新しい花を追加する手順

### チェックリスト

1. **コンセプト決定**
   - 花びらの形（平ら？カップ？反り？ハート？）
   - 花びらの枚数（6 / 8 / 14 / 多層？）
   - 特徴（斑点・おしべが長い・複葉など）

2. **Shape を `petalLibrary.ts` に追加**
   - 最低でも花びら用、必要なら葉用

3. **`XxxFlower.tsx` を作成**
   - 共通の茎・葉・萼
   - `Bud` / `Opening` / `Bloom` / `Rich` / `Spectacular` の 5 関数
   - `XxxFlower({ stage, position })` でエントリーポイント

4. **ステージ 3 を先に作る**
   - ここが主役なので、最初に満足いくまで作り込む
   - 花芯・おしべまで入れる

5. **ステージ 4, 5 はステージ 3 の拡張**
   - 外側にリングを一つ足す → Rich
   - さらに発光・浮遊・装飾を足す → Spectacular

6. **ステージ 1, 2 はあとから**
   - 蕾と開きかけは、ステージ 3 の色を流用すれば楽

7. **`FlowerGalleryScene.tsx` の `VARIETIES` に追加**

8. **`tsc -b` と `vite build` で確認**

### 所要時間の目安

ディテール重視だと 1 品種あたり 300〜500 行、2〜3 時間のコーディング。
Shape を最初に決めてしまえば、後は PetalRing の繰り返しで組み上がる。

---

## 11. 参考ファイルマップ

| ファイル | 内容 |
|---|---|
| `src/petalLibrary.ts` | 花びら・葉の `THREE.Shape` |
| `src/Stamens.tsx` | 花芯のおしべ散布（ドーム/平面、花糸つき/なし） |
| `src/GerberaFlower.tsx` | 放射花びら + 黄芯の基本形 |
| `src/TulipFlower.tsx` | 6 枚カップの基本形、抱き葉 |
| `src/LilyFlower.tsx` | 反り返り花びら、長い曲がったおしべ、斑点 |
| `src/RoseFlower.tsx` | 4〜6 リングの螺旋、複葉、棘 |
| `src/FlowerGalleryScene.tsx` | 品種 × ステージのグリッド表示、Bloom 設定 |

新しい花を作る時は、最も近い品種の `Xxx Flower.tsx` をコピーして Shape を差し替える → PetalRing のパラメータを調整、が最短ルート。
