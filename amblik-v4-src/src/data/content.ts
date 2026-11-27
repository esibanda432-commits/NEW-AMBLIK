// All Ämblik site copy lives here, so wording can be edited without touching layout.
// Ämblik is a White Raven Tech-delivered offer: describe only scope the team has confirmed
// it can deliver today. Review any new claims with the team before publishing.

export const company = {
  product: 'Ämblik',
  tagline: 'Sales & Marketing Intelligence for Real Growth.',
  maker: 'White Raven Tech',
  makerUrl: 'https://whiteraventech.com/',
  email: 'info@whiteraventech.com',
  callUrl: 'https://whiteraventech.com/schedule-consultation/',
  linkedin: 'https://linkedin.com/company/white-raven-technology',
};

export type PanelId =
  | 'demand' | 'campaigns' | 'leads' | 'crm'
  | 'how' | 'who' | 'about' | 'call';

export interface PanelItem { title: string; text: string; href?: string }

export interface Panel {
  id: PanelId;
  label: string;
  short: string;    // label under each dial node
  teaser: string;
  title: string;
  intro: string;
  items: PanelItem[];
  cta?: { label: string; href: string };
}

const call = { label: 'Book a call', href: company.callUrl };

export const panels: Panel[] = [
  {
    id: 'demand',
    label: 'Demand Generation & Outreach',
    short: 'Outreach',
    teaser: 'Reach the right buyers, consistently.',
    title: 'Demand generation and outreach.',
    intro: 'Build a steady presence in front of the buyers who matter most to your business.',
    items: [
      { title: 'Defined audience', text: 'Outreach starts from a clear picture of who your best-fit buyers are.' },
      { title: 'Consistent presence', text: 'Regular, relevant contact rather than one-off bursts of activity.' },
      { title: 'Messages that fit', text: 'Outreach written for the people receiving it.' },
    ],
    cta: call,
  },
  {
    id: 'campaigns',
    label: 'Campaign Management',
    short: 'Campaigns',
    teaser: 'Every campaign planned, run and tracked.',
    title: 'Campaign management.',
    intro: 'Keep every campaign organised, from planning through to results.',
    items: [
      { title: 'Planned', text: 'Clear goals, audiences and timing for each campaign.' },
      { title: 'Run', text: 'Campaigns delivered and managed by the White Raven Tech team.' },
      { title: 'Reviewed', text: 'Results looked at regularly so each campaign informs the next.' },
    ],
    cta: call,
  },
  {
    id: 'leads',
    label: 'Lead Capture & Qualification',
    short: 'Leads',
    teaser: 'Interest captured, then sorted by fit.',
    title: 'Lead capture and qualification.',
    intro: 'Turn interest into conversations worth having, and focus time where it counts.',
    items: [
      { title: 'Capture', text: 'Make it simple for interested prospects to take the next step.' },
      { title: 'Qualify', text: 'Sort leads by fit, so your team knows who to speak to first.' },
      { title: 'Prioritise', text: 'Spend sales time on the opportunities most likely to move.' },
    ],
    cta: call,
  },
  {
    id: 'crm',
    label: 'CRM Integration',
    short: 'CRM',
    teaser: 'Leads land where your team already works.',
    title: 'CRM integration.',
    intro: 'Qualified leads are handed over into the place your sales team already works.',
    items: [
      { title: 'Clean handover', text: 'Leads arrive with the context your team needs to follow up.' },
      { title: 'One source of truth', text: 'Pipeline activity stays visible in your CRM.' },
      { title: 'Your setup', text: 'We confirm how handover works with your systems on a call.' },
    ],
    cta: call,
  },
  {
    id: 'how',
    label: 'How It Works',
    short: 'How',
    teaser: 'Attract. Engage. Capture. Hand over.',
    title: 'One web, from first touch to pipeline.',
    intro: 'Ämblik connects each stage of acquisition, so no interested prospect slips through the gaps.',
    items: [
      { title: 'Attract', text: 'Generate demand among your best-fit buyers.' },
      { title: 'Engage', text: 'Run campaigns that keep you in front of them.' },
      { title: 'Capture', text: 'Capture interest and qualify it by fit.' },
      { title: 'Hand over', text: 'Pass qualified leads into your CRM for follow-up.' },
    ],
    cta: call,
  },
  {
    id: 'who',
    label: 'Who It’s For',
    short: 'For you',
    teaser: 'Teams who need a fuller pipeline.',
    title: 'For teams who want a fuller pipeline.',
    intro: 'Ämblik suits businesses that sell to other businesses and want more of the right conversations.',
    items: [
      { title: 'Founders and leadership', text: 'A dependable source of new opportunities.' },
      { title: 'Sales teams', text: 'More time selling, less time searching.' },
      { title: 'Marketing teams', text: 'Campaigns connected directly to pipeline.' },
    ],
    cta: call,
  },
  {
    id: 'about',
    label: 'About',
    short: 'About',
    teaser: 'Delivered by White Raven Tech.',
    title: 'Delivered by White Raven Tech.',
    intro: 'Ämblik is a White Raven Tech offer, delivered and managed by the team behind its software engineering, automation and delivery work.',
    items: [
      { title: 'Why “Ämblik”?', text: 'Ämblik is Estonian for spider: a web built to catch opportunities.' },
      { title: 'Visit White Raven Tech', text: 'Learn more about the team behind Ämblik.', href: company.makerUrl },
    ],
  },
  {
    id: 'call',
    label: 'Book a Call',
    short: 'Book',
    teaser: 'Talk to the team about your pipeline.',
    title: 'Let’s talk about your pipeline.',
    intro: 'Book a call with our team. We will learn about your goals and show you how Ämblik could work for you.',
    items: [
      { title: 'Email', text: company.email, href: `mailto:${company.email}?subject=%C3%84mblik%20enquiry` },
      { title: 'LinkedIn', text: 'White Raven Tech', href: company.linkedin },
    ],
    cta: call,
  },
];

export const panelById = (id: PanelId) => panels.find(p => p.id === id)!;
