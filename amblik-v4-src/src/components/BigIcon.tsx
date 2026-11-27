import type { PanelId } from '../data/content';

// Large, simple line icons, one per option. They sit behind the text in the Explore bar.
// Drawn on a 120 grid in the Ämblik network style: lines, nodes and open shapes.
const dot = (x: number, y: number, r = 5) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />;

const icons: Record<PanelId, JSX.Element> = {
  // Demand generation & outreach: megaphone sending signal
  demand: (
    <>
      <path d="M18 48h12l40-22v68L30 72H18z" />
      <path d="M34 74l6 26h12l-6-24" />
      <path d="M82 44a22 22 0 010 32M92 34a36 36 0 010 52M102 24a50 50 0 010 72" />
    </>
  ),
  // Campaign management: a connected route of stops
  campaigns: (
    <>
      <path d="M14 92L44 52l32 22 30-46" />
      {dot(14, 92)}{dot(44, 52)}{dot(76, 74)}{dot(106, 28, 7)}
      <path d="M92 20h16v16" />
      <path d="M10 108h100" strokeDasharray="3 5" />
    </>
  ),
  // Lead capture & qualification: funnel
  leads: (
    <>
      <path d="M12 18h96L70 62v36l-20 10V62z" />
      <path d="M30 34h60M44 48h32" />
      {dot(30, 8, 3)}{dot(60, 6, 3)}{dot(90, 8, 3)}
    </>
  ),
  // CRM integration: database syncing
  crm: (
    <>
      <ellipse cx="44" cy="26" rx="30" ry="10" />
      <path d="M14 26v56c0 5.5 13.4 10 30 10s30-4.5 30-10V26M14 54c0 5.5 13.4 10 30 10s30-4.5 30-10" />
      <path d="M86 50h24M102 42l8 8-8 8M110 80H86M94 72l-8 8 8 8" />
    </>
  ),
  // How it works: a sequence of steps
  how: (
    <>
      <rect x="6" y="42" width="28" height="28" rx="5" />
      <rect x="46" y="42" width="28" height="28" rx="5" />
      <rect x="86" y="42" width="28" height="28" rx="5" />
      <path d="M34 56h12M74 56h12M42 52l4 4-4 4M82 52l4 4-4 4" />
      <path d="M20 42V24h40M100 70v22H60" strokeDasharray="3 5" />
      {dot(60, 24, 4)}{dot(60, 92, 4)}
    </>
  ),
  // Who it's for: a group of people
  who: (
    <>
      <circle cx="60" cy="38" r="14" />
      <path d="M34 104c0-20 11-34 26-34s26 14 26 34z" />
      <circle cx="22" cy="52" r="9" />
      <path d="M6 98c0-14 7-24 17-24" />
      <circle cx="98" cy="52" r="9" />
      <path d="M114 98c0-14-7-24-17-24" />
    </>
  ),
  // About: the Ämblik spider at the centre of a network
  about: (
    <>
      <circle cx="60" cy="66" r="11" />
      <circle cx="60" cy="46" r="7" />
      <path d="M50 60L28 46 12 54M50 68L26 70 10 88M53 75L34 94 24 112M52 52L38 30 28 16" />
      <path d="M70 60l22-14 16 8M70 68l24 2 16 18M67 75l19 19 10 18M68 52l14-22 10-14" />
      {dot(52, 24, 3)}{dot(68, 24, 3)}
    </>
  ),
  // Book a call: phone with signal
  call: (
    <>
      <g transform="scale(4.4) translate(2 2.4)">
        <path vectorEffect="non-scaling-stroke" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </g>
      <path d="M72 18a30 30 0 0130 30M72 36a14 14 0 0114 14" />
    </>
  ),
};

export default function BigIcon({ id }: { id: PanelId }) {
  return (
    <span className="ix-bg" aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {icons[id]}
      </svg>
    </span>
  );
}
