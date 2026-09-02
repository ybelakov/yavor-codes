/** Tiny synthesized UI sounds. Deliberately soft, never Apple's actual
 *  (copyrighted) sounds — just polite approximations. */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

let muted = false;
export function setMuted(m: boolean): void {
  muted = m;
}

function tone(freq: number, start: number, dur: number, gain: number, type: OscillatorType = "sine"): void {
  const ac = audio();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.05);
}

export const sounds = {
  ding(): void {
    tone(880, 0, 0.28, 0.05);
    tone(1318.5, 0.07, 0.32, 0.04);
  },
  login(): void {
    tone(523.25, 0, 0.5, 0.035);
    tone(659.25, 0.02, 0.5, 0.035);
    tone(783.99, 0.04, 0.55, 0.035);
  },
  trash(): void {
    const ac = audio();
    if (!ac || muted) return;
    const len = 0.16;
    const buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length / 5)) * 0.25;
    }
    const src = ac.createBufferSource();
    const g = ac.createGain();
    g.gain.value = 0.35;
    src.buffer = buf;
    src.connect(g).connect(ac.destination);
    src.start();
  },
  thud(): void {
    tone(140, 0, 0.16, 0.09, "triangle");
    tone(90, 0.01, 0.18, 0.07, "sine");
  },
};
