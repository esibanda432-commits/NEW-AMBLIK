import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PanelId } from '../data/content';
import WebCanvas from './WebCanvas';
const logoDark = '/brand/amblik-wordmark-reverse.svg';

const menu: { id: PanelId; label: string; short: string }[] = [
  { id: 'how', label: 'How It Works', short: 'How' },
  { id: 'who', label: 'Who It’s For', short: 'For' },
  { id: 'about', label: 'About', short: 'About' },
  { id: 'call', label: 'Book a Call', short: 'Book' },
];

type Snaps = { slim: number; normal: number; max: number };
type Mode = keyof Snaps;
const ORDER: Mode[] = ['slim', 'normal', 'max'];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function measure(): Snaps {
  const H = window.innerHeight;
  const mobile = window.innerWidth <= 820;
  const slim = mobile ? 58 : 66;
  const deck = (document.querySelector('.index') as HTMLElement | null)?.offsetHeight ?? 240;
  const room = H - deck - (mobile ? 270 : 290);
  const max = clamp(Math.min(room, H * 0.56), slim + 130, 640);
  const normal = clamp(H * (mobile ? 0.28 : 0.3), slim + 110, max - 50);
  return { slim, normal, max };
}

const rubber = (h: number, s: Snaps) =>
  h > s.max ? s.max + Math.min(80, (h - s.max) * 0.35)
  : h < s.slim ? s.slim - Math.min(16, (s.slim - h) * 0.3)
  : h;

const nearest = (h: number, s: Snaps) =>
  ORDER.reduce((a, m) => (Math.abs(s[m] - h) < Math.abs(s[a] - h) ? m : a), 'normal' as Mode);

export default function Banner({ onOpen }: { onOpen: (id: PanelId) => void }) {
  const ref = useRef<HTMLElement>(null);
  const [snaps, setSnaps] = useState<Snaps>({ slim: 66, normal: 250, max: 420 });
  const [mode, setMode] = useState<Mode>('normal');
  const [h, setH] = useState(250);
  const [dragging, setDragging] = useState(false);

  const hRef = useRef(250);
  const modeRef = useRef<Mode>('normal');
  const snapsRef = useRef(snaps);
  const spring = useRef({ raf: 0, v: 0 });
  const drag = useRef({ id: -1, y: 0, h: 0, moved: false, t: 0, v: 0, lastY: 0 });
  const wheelLock = useRef(0);

  const setHeight = (v: number) => { hRef.current = v; setH(v); };

  const animateTo = useCallback((target: number, velocity = 0) => {
    cancelAnimationFrame(spring.current.raf);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setHeight(target); return; }
    spring.current.v = velocity;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const x = hRef.current;
      const a = 210 * (target - x) - 17 * spring.current.v;
      spring.current.v += a * dt;
      const next = x + spring.current.v * dt;
      if (Math.abs(target - next) < 0.4 && Math.abs(spring.current.v) < 4) { setHeight(target); return; }
      setHeight(next);
      spring.current.raf = requestAnimationFrame(tick);
    };
    spring.current.raf = requestAnimationFrame(tick);
  }, []);

  const snapTo = useCallback((m: Mode, velocity = 0) => {
    modeRef.current = m;
    setMode(m);
    animateTo(snapsRef.current[m], velocity);
  }, [animateTo]);

  const step = useCallback((dir: 1 | -1) => {
    snapTo(ORDER[clamp(ORDER.indexOf(modeRef.current) + dir, 0, 2)]);
  }, [snapTo]);

  useLayoutEffect(() => {
    const update = () => {
      const s = measure();
      snapsRef.current = s;
      setSnaps(s);
      if (drag.current.id === -1) { cancelAnimationFrame(spring.current.raf); setHeight(s[modeRef.current]); }
    };
    update();
    const t = setTimeout(update, 80);
    window.addEventListener('resize', update);
    return () => { clearTimeout(t); window.removeEventListener('resize', update); cancelAnimationFrame(spring.current.raf); };
  }, []);

  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(spring.current.raf);
    const now = performance.now();
    drag.current = { id: e.pointerId, y: e.clientY, h: hRef.current, moved: false, t: now, v: 0, lastY: e.clientY };

    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (d.id !== ev.pointerId) return;
      const dy = ev.clientY - d.y;
      if (!d.moved) {
        if (Math.abs(dy) < 6) return;
        d.moved = true;
        setDragging(true);
      }
      ev.preventDefault();
      const t = performance.now();
      d.v = 0.7 * d.v + 0.3 * ((ev.clientY - d.lastY) / Math.max(1, t - d.t));
      d.t = t; d.lastY = ev.clientY;
      setHeight(rubber(d.h + dy, snapsRef.current));
    };
    const up = (ev: PointerEvent) => {
      const d = drag.current;
      if (d.id !== ev.pointerId) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      d.id = -1;
      if (!d.moved) { animateTo(snapsRef.current[modeRef.current]); return; }
      setDragging(false);
      const s = snapsRef.current;
      const target = Math.abs(d.v) > 0.45
        ? ORDER[clamp(ORDER.indexOf(nearest(d.h, s)) + (d.v > 0 ? 1 : -1), 0, 2)]
        : nearest(hRef.current, s);
      snapTo(target, clamp(d.v * 1000, -2500, 2500));
      setTimeout(() => { d.moved = false; }, 0);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); }
  };

  const wheelStep = useCallback((deltaY: number) => {
    const now = Date.now();
    if (Math.abs(deltaY) < 6 || now < wheelLock.current) return;
    wheelLock.current = now + 480;
    step(deltaY > 0 ? -1 : 1);
  }, [step]);

  useEffect(() => {
    const onWin = (e: WheelEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('.index, .sheet-wrap')) return;
      const thread = t.closest('.thread') as HTMLElement | null;
      if (thread) {
        const atTop = thread.scrollTop <= 1;
        const atEnd = thread.scrollTop + thread.clientHeight >= thread.scrollHeight - 1;
        if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atEnd)) return;
      }
      wheelStep(e.deltaY);
    };
    window.addEventListener('wheel', onWin, { passive: true });
    return () => window.removeEventListener('wheel', onWin);
  }, [wheelStep]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let f = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cancelAnimationFrame(f);
      f = requestAnimationFrame(() => ref.current?.style.setProperty('--mx', String(e.clientX / window.innerWidth - 0.5)));
    };
    window.addEventListener('pointermove', onMove);
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(f); };
  }, []);

  const compact = snaps.normal - snaps.slim < 170;
  const p = clamp((h - snaps.slim) / Math.max(1, snaps.normal - snaps.slim), 0, 1.15);
  const q = clamp((h - snaps.normal) / Math.max(1, snaps.max - snaps.normal), 0, 1.2);

  return (
    <header
      ref={ref}
      className={`banner is-${mode} ${compact ? 'is-compact' : ''} ${dragging ? 'is-dragging' : ''}`}
      style={{ height: h, '--h': `${h}px`, '--p': p, '--q': q } as React.CSSProperties}
      onPointerDown={onDown}
      onClickCapture={onClickCapture}
    >
      <div className="bg" aria-hidden="true" />
      <div className="web-wrap" aria-hidden="true"><WebCanvas /></div>
      <div className="veil" aria-hidden="true" />
      <figure className="hero-art" aria-hidden="true">
        <img className="art-main" src="/brand/spider-field.jpg" alt="" draggable={false} />
        <img className="art-side" src="/brand/spider-hero.jpg" alt="" draggable={false} />
        <figcaption><i />The Traveling Strategist</figcaption>
      </figure>

      <nav className="bar" aria-label="Main">
        <a className="brand" href="/" aria-label="Ämblik home">
          <img src={logoDark} alt="Ämblik" draggable={false} />
          <span className="brand-by">by White Raven Tech</span>
        </a>
        <ul className="menu">
          {menu.map(m => (
            <li key={m.id}>
              <button type="button" className={m.id === 'call' ? 'is-cta' : ''} onClick={() => onOpen(m.id)}>
                <span className="lg">{m.label}</span><span className="sm">{m.short}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="hero" aria-hidden={p < 0.5}>
        <p className="hero-kicker"><i />Sales &amp; marketing intelligence for real growth</p>
        <h1><span>Connections</span> <span className="h1-alt">with a purpose<b>.</b></span></h1>
        <p className="hero-sub">Demand generation, campaign management, lead capture and CRM integration, delivered by White Raven Tech.</p>
        <div className="hero-actions">
          <button type="button" className="btn-link" onClick={() => onOpen('how')} tabIndex={p < 0.5 ? -1 : 0}>How it works <span aria-hidden="true">→</span></button>
        </div>
      </div>

      <button
        type="button"
        className="grip"
        aria-label={mode === 'max' ? 'Shrink banner' : 'Expand banner'}
        title="Pull down to expand, push up to slim"
        onClick={() => step(mode === 'max' ? -1 : 1)}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') { e.preventDefault(); step(1); }
          if (e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
        }}
      >
        <span /><span /><span />
      </button>
    </header>
  );
}
