import type { PanelId } from '../data/content';

// Line icons for each Ämblik option.
const paths: Record<PanelId, string> = {
  demand: 'M3 11l15-6v14L3 13z M7 12.5V18h3v-4.3 M18 9.5a3 3 0 0 1 0 5',
  campaigns: 'M4 5h16v4H4z M4 13h10v6H4z M17 13h3v6h-3z',
  leads: 'M3 5h18l-7 8v6l-4-2v-4z',
  crm: 'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  how: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M12 3v7 M12 14v7 M3 12h7 M14 12h7 M5.6 5.6l5 5 M13.4 13.4l5 5 M18.4 5.6l-5 5 M10.6 13.4l-5 5',
  who: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20a6 6 0 0 1 12 0 M16 6a3 3 0 0 1 0 6 M17 14a5 5 0 0 1 4 6',
  about: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v6 M12 7.5v.5',
  call: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
};

export default function Icon({ id }: { id: PanelId }) {
  return (
    <svg className="card-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[id]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
