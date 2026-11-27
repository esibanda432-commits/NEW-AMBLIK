import { useEffect, useRef, useState, type FormEvent } from 'react';
import { aiReply, greeting, localReply, suggestions, type Action, type Reply } from '../data/assistant';
import type { PanelId } from '../data/content';
const glyph = '/brand/spider-hero.jpg';

// The business journey from the brand board: Audience > Signal > Account > Human decision > Sales action.
const journey = [
  { label: 'Audience', note: 'Who you need to reach', c: '#3EC7CF' },
  { label: 'Signal', note: 'What the campaign tells you', c: '#7846E8' },
  { label: 'Account', note: 'A qualified opportunity', c: '#A044A5' },
  { label: 'Human decision', note: 'Your team stays in control', c: '#D7A24D' },
  { label: 'Sales action', note: 'The call that matters', c: '#FF3B1F' },
];

// Faint network pattern behind the stage: connected paths and nodes in the brand palette.
function NetBackdrop() {
  return (
    <svg className="silk-net" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" strokeWidth="1.4" strokeLinejoin="round">
        <polyline points="0,300 160,240 300,280 470,190 640,230 800,140 980,190 1200,110" stroke="#3EC7CF" opacity=".5" />
        <polyline points="0,120 140,170 330,100 520,150 700,80 900,120 1060,60 1200,90" stroke="#7846E8" opacity=".45" />
        <polyline points="0,370 220,330 420,360 640,320 860,350 1040,300 1200,330" stroke="#D7A24D" opacity=".35" />
        <polyline points="300,280 330,100 470,190 520,150" stroke="#A044A5" opacity=".35" />
        <polyline points="800,140 700,80 640,230" stroke="#3EC7CF" opacity=".3" />
      </g>
      {[[160,240,'#3EC7CF'],[470,190,'#3EC7CF'],[800,140,'#FF3B1F'],[980,190,'#3EC7CF'],[330,100,'#7846E8'],[700,80,'#7846E8'],[1060,60,'#A044A5'],[420,360,'#D7A24D'],[860,350,'#D7A24D'],[520,150,'#FFFFFF']].map(([x, y, c], i) => (
        <g key={i}><circle cx={x as number} cy={y as number} r="9" fill={c as string} opacity=".16" /><circle cx={x as number} cy={y as number} r="3.6" fill={c as string} /></g>
      ))}
    </svg>
  );
}

interface Msg { id: number; role: 'user' | 'assistant'; text: string; actions?: Action[]; typing?: boolean }

let nextId = 1;

export default function Assistant({ onOpen }: { onOpen: (id: PanelId) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // Reveal assistant replies word by word.
  const say = (reply: Reply) => {
    const id = nextId++;
    const words = reply.text.split(' ');
    setMsgs(m => [...m, { id, role: 'assistant', text: '', typing: true }]);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setMsgs(m => m.map(x => (x.id === id ? { ...x, text: words.slice(0, i).join(' ') } : x)));
      if (i >= words.length) {
        clearInterval(timer);
        setMsgs(m => m.map(x => (x.id === id ? { ...x, typing: false, actions: reply.actions } : x)));
      }
    }, 26);
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t = setTimeout(() => say(greeting), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, thinking]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || thinking) return;
    setInput('');
    const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant')?.text;
    const history = [...msgs, { role: 'user' as const, text: q }].map(m => ({ role: m.role, content: m.text }));
    setMsgs(m => [...m, { id: nextId++, role: 'user', text: q }]);
    setThinking(true);
    const local = localReply(q, lastAssistant);
    const [ai] = await Promise.all([aiReply(history), new Promise(r => setTimeout(r, 600))]);
    setThinking(false);
    say(ai ? { text: ai, actions: local.actions } : local);
  };

  const act = (a: Action) => {
    if (a.panel) onOpen(a.panel);
    else if (a.href) window.open(a.href, a.href.startsWith('mailto:') ? '_self' : '_blank', 'noopener');
    else ask(a.label);
  };

  const submit = (e: FormEvent) => { e.preventDefault(); ask(input); };
  const busy = thinking || msgs.some(m => m.typing);

  return (
    <section className="silk" aria-label="Ask Ämblik">
      <NetBackdrop />

      <aside className="rail rail-l" aria-label="The Ämblik business journey">
        <p className="rail-kicker"><i />The business journey</p>
        <ol className="journey">
          {journey.map((j, i) => (
            <li key={j.label} style={{ '--c': j.c } as React.CSSProperties}>
              <span className="j-node"><b>{i + 1}</b></span>
              <span className="j-text"><strong>{j.label}</strong><em>{j.note}</em></span>
            </li>
          ))}
        </ol>
        <p className="rail-foot">A campaign signal informs a qualified opportunity and a human sales decision.</p>
      </aside>

      <div className="silk-inner">
        <div className="silk-head">
          <span className={`silk-mark ${busy ? 'is-busy' : ''}`} aria-hidden="true"><img src={glyph} alt="" /></span>
          <div>
            <p className="silk-title">Ask Ämblik</p>
            <p className="silk-status">{thinking ? 'Preparing an answer…' : 'Questions about your pipeline, answered'}</p>
          </div>
        </div>

        <div className="thread" ref={listRef} aria-live="polite">
          {msgs.map(m => (
            <div key={m.id} className={`msg ${m.role}`}>
              {m.role === 'assistant' && <span className="knot" aria-hidden="true" />}
              <p>{m.text}{m.typing && <span className="caret" />}</p>
              {m.actions && m.actions.length > 0 && (
                <div className="msg-actions">
                  {m.actions.map(a => (
                    <button key={a.label} type="button" onClick={() => act(a)}>{a.label}<span aria-hidden="true">→</span></button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {thinking && <div className="msg assistant"><span className="knot" aria-hidden="true" /><p className="dots"><i /><i /><i /></p></div>}
        </div>

        <div className="suggestions" aria-label="Suggested questions">
          {suggestions.map(s => (
            <button key={s} type="button" onClick={() => ask(s)} disabled={busy}>{s}</button>
          ))}
        </div>

        <form className="ask" onSubmit={submit}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about outreach, leads, your CRM…" aria-label="Your question" maxLength={500} />
          <button type="submit" disabled={!input.trim() || busy} aria-label="Send">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </form>
      </div>

      <aside className="rail rail-r" aria-label="Ämblik at a glance">
        <figure className="r-photo">
          <img src="/brand/spider-laptop.jpg" alt="" draggable={false} />
          <figcaption><b>Know the audience.<br />Shape the message.<br />Choose the channels.</b></figcaption>
        </figure>
        <div className="r-card r-hub">
          <p className="rail-kicker"><i />Insight</p>
          <h3>Turn signals<br />into strategy.</h3>
          <p>Unify data, decisions, and action with ÄMBLIK.</p>
          <span className="r-bar" aria-hidden="true"><i /><i /><i /><i /></span>
        </div>
        <div className="r-card r-eval">
          <strong>Explore.</strong><strong>Evaluate.</strong><strong>Act.</strong>
        </div>
      </aside>
    </section>
  );
}
