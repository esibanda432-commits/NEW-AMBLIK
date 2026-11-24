import { useCallback, useEffect, useRef, useState } from 'react';
import { panels, type PanelId } from '../data/content';

const N = panels.length;

// Editorial index: a numbered strip divided by hairlines. Swipe, drag, scroll or use the
// arrows; the selected column shows its description and an Open link.
export default function Index({ onOpen }: { onOpen: (id: PanelId) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  activeRef.current = active;
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const wheelLock = useRef(0);

  const cols = () => Array.from(track.current?.querySelectorAll<HTMLElement>('.ix-col') ?? []);
  // The reading position is the strip's inner left edge (after its padding).
  const inset = () => (track.current ? parseFloat(getComputedStyle(track.current).paddingLeft) || 0 : 0);

  const select = useCallback((i: number, smooth = true) => {
    const el = track.current, c = cols()[i];
    setActive(i);
    if (!el || !c) return;
    // bring the selected column to the reading position
    const target = Math.max(0, Math.min(c.offsetLeft - inset(), el.scrollWidth - el.clientWidth));
    el.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const go = useCallback((dir: number) => select((activeRef.current + dir + N) % N), [select]);

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

  // Mouse drag (touch devices swipe natively).
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !track.current) return;
    drag.current = { down: true, x: e.clientX, left: track.current.scrollLeft, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current, el = track.current;
    if (!d.down || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; el.classList.add('is-dragging'); }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const onUp = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    track.current?.classList.remove('is-dragging');
    setTimeout(() => { d.moved = false; }, 0);
  };

  // After a swipe or drag settles, select the column nearest the reading position.
  const settle = useRef(0);
  const onScroll = () => {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = track.current;
      if (!el || drag.current.down) return;
      const mark = el.scrollLeft + inset();
      let best = 0, dist = Infinity;
      cols().forEach((c, i) => { const d = Math.abs(c.offsetLeft - mark); if (d < dist) { dist = d; best = i; } });
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 && activeRef.current > best) return; // end of strip
      if (best !== activeRef.current && Math.abs(cols()[activeRef.current].offsetLeft - mark) > cols()[0].offsetWidth * 0.6) setActive(best);
    }, 140);
  };

  const onWheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const now = Date.now();
    if (Math.abs(d) < 8 || now < wheelLock.current) return;
    wheelLock.current = now + 320;
    go(d > 0 ? 1 : -1);
  };

  return (
    <section className="index" aria-label="Explore Ämblik">
      <div className="ix-head">
        <p className="kicker"><i />Explore</p>
        <div className="ix-nav">
          <span className="ix-count" aria-live="polite">{String(active + 1).padStart(2, '0')} <em>/ {String(N).padStart(2, '0')}</em></span>
          <button type="button" onClick={() => go(-1)} aria-label="Previous">←</button>
          <button type="button" onClick={() => go(1)} aria-label="Next">→</button>
        </div>
      </div>

      <div
        className="ix-track"
        ref={track}
        onScroll={onScroll}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onWheel={onWheel}
        role="tablist"
      >
        {panels.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`ix-col ${i === active ? 'is-active' : ''}`}
            onClick={() => {
              if (drag.current.moved) return;
              if (i === active) onOpen(p.id); else select(i);
            }}
          >
            <span className="ix-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="ix-label">{p.label}</span>
            <span className="ix-teaser">{p.teaser}</span>
            <span className="ix-open">Open <span aria-hidden="true">→</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
