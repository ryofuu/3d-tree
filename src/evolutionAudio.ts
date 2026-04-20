let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx() {
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(ctx.destination);
  }
  return { ctx: ctx!, out: masterGain! };
}

export function primeAudio() {
  const { ctx } = getCtx();
  if (ctx.state === "suspended") void ctx.resume();
}

type ToneOptions = {
  type?: OscillatorType;
  attack?: number;
  release?: number;
  gain?: number;
};

function tone(
  freq: number,
  startOffset: number,
  dur: number,
  opts: ToneOptions = {},
) {
  const { ctx, out } = getCtx();
  const { type = "sine", attack = 0.02, release = 0.1, gain = 0.12 } = opts;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const t0 = ctx.currentTime + startOffset;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + attack);
  g.gain.setValueAtTime(gain, t0 + Math.max(dur - release, attack));
  g.gain.linearRampToValueAtTime(0, t0 + dur);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function sweep(
  fromFreq: number,
  toFreq: number,
  startOffset: number,
  dur: number,
  gain = 0.1,
  type: OscillatorType = "sine",
) {
  const { ctx, out } = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const t0 = ctx.currentTime + startOffset;
  osc.type = type;
  osc.frequency.setValueAtTime(fromFreq, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(toFreq, 0.001), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.08);
  g.gain.setValueAtTime(gain, t0 + dur * 0.75);
  g.gain.linearRampToValueAtTime(0, t0 + dur);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(startOffset: number, dur: number, gain = 0.08) {
  const { ctx, out } = getCtx();
  const bufferSize = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2000;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(out);
  src.start(ctx.currentTime + startOffset);
}

/**
 * 進化シーケンスの BGM / SE をスケジュール。
 * タイムライン（秒）:
 *  0.00-0.60 preparing: ハープ上昇アルペジオ + 低音ロール
 *  0.60-2.10 cocoon: シンセパッドクレッシェンド + 上昇シマー
 *  2.10-2.25 silence（タメ）
 *  2.25-2.75 flash: ジャーン（C メジャー和音の重ね撃ち）
 *  2.50-4.50 blooming: グロッケン系キラキラ
 *  4.50-5.70 afterglow: 低音パッドの余韻フェード
 */
export function playEvolutionSequence() {
  primeAudio();

  // preparing
  const harpNotes = [261.63, 329.63, 392, 493.88, 587.33, 783.99];
  harpNotes.forEach((f, i) =>
    tone(f, i * 0.09, 0.28, { type: "triangle", gain: 0.09 }),
  );
  sweep(120, 60, 0, 0.6, 0.08, "sine");

  // cocoon
  sweep(220, 660, 0.6, 1.4, 0.1, "sine");
  sweep(330, 880, 0.7, 1.35, 0.07, "triangle");
  for (let i = 0; i < 12; i++) {
    tone(900 + i * 140, 0.75 + i * 0.11, 0.12, {
      type: "sine",
      gain: 0.05,
      attack: 0.01,
      release: 0.05,
    });
  }

  // flash (ジャーン)
  const chord = [261.63, 329.63, 392.0, 523.25];
  chord.forEach((f) =>
    tone(f, 2.25, 0.6, { type: "sawtooth", gain: 0.11, attack: 0.005 }),
  );
  chord.forEach((f) =>
    tone(f * 2, 2.25, 0.55, { type: "triangle", gain: 0.07, attack: 0.005 }),
  );
  noiseBurst(2.24, 0.25, 0.1);

  // blooming glocken
  const sparkle = [1046.5, 1318.51, 1567.98, 2093.0];
  for (let i = 0; i < 16; i++) {
    const f = sparkle[i % sparkle.length] * (1 + (i % 3) * 0.003);
    tone(f, 2.55 + i * 0.12, 0.35, {
      type: "sine",
      gain: 0.05,
      attack: 0.005,
      release: 0.2,
    });
  }

  // afterglow pad
  sweep(220, 130, 4.5, 1.2, 0.06, "sine");
  tone(523.25, 4.5, 1.2, {
    type: "sine",
    gain: 0.04,
    attack: 0.2,
    release: 0.6,
  });
}
