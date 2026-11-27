import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { panels, type PanelId } from '../data/content';
import Icon from './Icon';

const N = panels.length;

// Shortest signed distance on a loop, so the dial turns endlessly.
const wrap = (d: number) => {
  let x = ((d % N) + N) % N;
  if (x > N / 2) x -= N;
  return x;
};

// Orbit dial: options sit on a curved thread that rotates as you swipe or drag.
// The node at the top is selected; its description shows in the caption below.
export default function Dial({ onOpen }: { onOpen: (id: PanelId) => void }) {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0); // live drag in steps
  const [geo, setGeo] = useState({ w: 1000, R: 1400, gap: 170, mobile: false });
  const stage = useRef<HTMLDivElement>(null);
  const ptr = useRef({ id: -1, x: 0, moved: false, t: 0, v: 0, lastX: 0 });
  const wheelLock = useRef(0);

  useLayoutEffect(() => {
    const measure = () => {
      const w = stage.current?.clientWidth ?? 1000;
      const mobile = w < 640;
      setGeo({ w, mobile, R: mobile ? 640 : Math.max(1100, w * 1.05), gap: mobile ? 98 : Math.min(180, Math.max(140, w / 8.5)) });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const go = useCallback((dir: number) => setActive(a => (a + dir + N) % N), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.querySelector('.sheet-wrap.is-open')) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  // Drag / swipe (mouse and touch).
  const down = (e: React.PointerEvent) => {
    ptr.current = { id: e.pointerId, x: e.clientX, moved: false, t: performance.now(), v: 0, lastX: e.clientX };
  };
  const move = (e: React.PointerEvent) => {
    const p = ptr.current;
    if (p.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    if (!p.moved && Math.abs(dx) > 6) { p.moved = true; stage.current?.setPointerCapture(e.pointerId); }
    if (!p.moved) return;
    const now = performance.now();
    p.v = 0.7 * p.v + 0.3 * ((e.clientX - p.lastX) / Math.max(1, now - p.t)); p.t = now; p.lastX = e.clientX;
    setDrag(-dx / geo.gap);
  };
  const up = (e: React.PointerEvent) => {
    const p = ptr.current;
    if (p.id !== e.pointerId) return;
    p.id = -1;
    if (!p.moved) return;
    let steps = Math.round(drag);
    if (steps === 0 && Math.abs(p.v) > 0.4) steps = p.v > 0 ? -1 : 1; // a flick turns one step
    if (steps) setActive(a => ((a + steps) % N + N) % N);
    setDrag(0);
    setTimeout(() => { p.moved = false; }, 0);
  };

  const wheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const now = Date.now();
    if (Math.abs(d) < 8 || now < wheelLock.current) return;
    wheelLock.current = now + 300;
    go(d > 0 ? 1 : -1);
  };

  const { w, R, gap, mobile } = geo;
  const stepAngle = gap / R; // radians between nodes
  const cx = w / 2;
  const top = mobile ? 40 : 44; // y of the selected node (orb and label) centre
  const shown = panels[active];
  const maxOff = mobile ? 2.3 : 3.6;

  // Thread the nodes sit on
  const arcSpan = stepAngle * (maxOff + 0.6);
  const arcPt = (a: number) => [cx + R * Math.sin(a), top + R - R * Math.cos(a)];
  const [ax, ay] = arcPt(-arcSpan), [bx, by] = arcPt(arcSpan);

  return (
    <section className="dial" aria-label="Explore Ämblik" aria-roledescription="carousel">
      <div
        className={`dial-stage ${drag ? 'is-dragging' : ''}`}
        ref={stage}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={wheel}
      >
        <svg className="dial-thread" width={w} height="100%" aria-hidden="true">
          <path d={`M${ax} ${ay} A ${R} ${R} 0 0 1 ${bx} ${by}`} />
        </svg>
        {panels.map((p, i) => {
          const off = wrap(i - active) - drag;
          const abs = Math.abs(off);
          const a = off * stepAngle;
          const [x, y] = arcPt(a);
          const isActive = wrap(i - active) === 0 && Math.abs(drag) < 0.5;
          const hidden = abs > maxOff;
          return (
            <button
              key={p.id}
              type="button"
              className={`node ${isActive ? 'is-active' : ''} ${p.id === 'call' ? 'is-cta' : ''}`}
              style={{
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${isActive ? 1 : Math.max(0.62, 0.86 - abs * 0.06)})`,
                opacity: hidden ? 0 : Math.max(0.25, 1 - abs * 0.2),
                pointerEvents: hidden ? 'none' : undefined,
                zIndex: 10 - Math.round(abs),
              }}
              tabIndex={isActive ? 0 : -1}
              aria-label={`${p.label}: ${p.teaser}`}
              onClick={() => {
                if (ptr.current.moved) return;
                if (isActive) onOpen(p.id); else setActive(i);
              }}
            >
              <span className="node-orb"><Icon id={p.id} /></span>
              <span className="node-label">{p.short}</span>
            </button>
          );
        })}
      </div>

      <div className="caption" aria-live="polite">
        <button type="button" className="dial-arrow" onClick={() => go(-1)} aria-label="Previous">←</button>
        <button type="button" className="caption-body" key={active} onClick={() => onOpen(shown.id)}>
          <span className="caption-title">{shown.label}</span>
          <span className="caption-text">{shown.teaser}</span>
          <span className="caption-open">Open →</span>
        </button>
        <button type="button" className="dial-arrow" onClick={() => go(1)} aria-label="Next">→</button>
      </div>
    </section>
  );
}
