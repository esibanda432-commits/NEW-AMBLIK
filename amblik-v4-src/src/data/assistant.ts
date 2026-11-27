import { company, type PanelId } from './content';

export interface Action { label: string; panel?: PanelId; href?: string }
export interface Reply { text: string; actions?: Action[] }

const open = (label: string, panel: PanelId): Action => ({ label, panel });
const call: Action = { label: 'Book a call', href: company.callUrl };

// Built-in answers: work with no backend. Each topic is matched on keywords.
// Ämblik's scope is confirmed per client, so specifics (pricing, tools, results)
// are routed to a call rather than answered with unconfirmed claims.
const topics: { keys: string[]; reply: Reply }[] = [
  {
    keys: ['how', 'work', 'works', 'process', 'turn', 'turns', 'steps', 'show me'],
    reply: {
      text: 'Ämblik works like a web. We generate demand among your best-fit buyers, keep them engaged through managed campaigns, capture and qualify their interest, then hand qualified leads into your CRM.',
      actions: [open('How it works', 'how'), call],
    },
  },
  {
    keys: ['demand', 'outreach', 'prospect', 'prospects', 'prospecting', 'reach', 'cold', 'email', 'linkedin'],
    reply: { text: 'Demand generation and outreach puts you in front of the buyers who matter, with consistent, relevant contact rather than one-off bursts.', actions: [open('Demand & outreach', 'demand')] },
  },
  {
    keys: ['campaign', 'campaigns', 'manage', 'managed', 'marketing'],
    reply: { text: 'Campaigns are planned, run and reviewed by the White Raven Tech team, so each one informs the next.', actions: [open('Campaign management', 'campaigns')] },
  },
  {
    keys: ['lead', 'leads', 'capture', 'qualify', 'qualification', 'qualified', 'scoring', 'score'],
    reply: { text: 'Ämblik captures interest and sorts leads by fit, so your team knows exactly who to speak to first.', actions: [open('Lead capture', 'leads')] },
  },
  {
    keys: ['crm', 'hubspot', 'salesforce', 'pipedrive', 'integration', 'integrate', 'handover', 'handoff'],
    reply: { text: 'Qualified leads are handed into the CRM your team already uses. We confirm exactly how that works with your systems on a call.', actions: [open('CRM integration', 'crm'), call] },
  },
  {
    keys: ['who', 'for', 'suitable', 'fit', 'b2b', 'industry', 'industries', 'small', 'business'],
    reply: { text: 'Ämblik suits B2B businesses that want more of the right conversations: founders, sales teams and marketing teams alike.', actions: [open('Who it’s for', 'who')] },
  },
  {
    keys: ['price', 'pricing', 'cost', 'costs', 'how much', 'fee', 'fees', 'package', 'packages', 'pilot'],
    reply: { text: 'Scope and pricing are tailored to your goals, so we confirm them on a short call once we understand what you need.', actions: [call] },
  },
  {
    keys: ['results', 'guarantee', 'leads per', 'roi', 'meetings', 'expect', 'how many'],
    reply: { text: 'Results depend on your market and offer, so we would rather discuss realistic expectations with you directly than quote figures here.', actions: [call] },
  },
  {
    keys: ['ai', 'tool', 'tools', 'software', 'platform', 'data', 'gdpr', 'privacy', 'compliance'],
    reply: { text: 'Good question for the team. They will walk you through the tools, data handling and compliance on a call.', actions: [call] },
  },
  {
    keys: ['call', 'book', 'talk', 'speak', 'contact', 'meeting', 'demo', 'human', 'someone'],
    reply: { text: `Book a call with our team, or email ${company.email}.`, actions: [call, open('Contact details', 'call')] },
  },
  {
    keys: ['name', 'mean', 'spider', 'amblik', 'ämblik', 'white raven', 'company', 'behind', 'about'],
    reply: { text: 'Ämblik is Estonian for spider: a web built to catch opportunities. It is delivered by White Raven Tech.', actions: [open('About Ämblik', 'about')] },
  },
];

const YES = /^(yes|yeah|yep|sure|ok|okay|please|go on|show me|y)\b/i;
const NO = /^(no|nope|not now|later|n)\b/i;
const HELLO = /^(hi|hello|hey|good (morning|afternoon|evening))\b/i;

export const greeting: Reply = {
  text: 'Hi, I’m the Ämblik assistant. Would you like to see how Ämblik turns outreach into qualified leads?',
  actions: [{ label: 'Yes, show me' }],
};

export const suggestions = [
  'How does Ämblik work?',
  'How are leads qualified?',
  'Does it connect to our CRM?',
  'What does Ämblik mean?',
];

export function localReply(input: string, lastAssistant?: string): Reply {
  const q = input.trim().toLowerCase();
  const asked = lastAssistant?.includes('into qualified leads?');
  if ((asked && YES.test(q)) || q === 'yes, show me') return topics[0].reply;
  if (asked && NO.test(q)) return { text: 'No problem. What would you like to know about Ämblik?' };
  if (HELLO.test(q) && q.split(' ').length < 4) return { text: 'Hello. What would you like to know about Ämblik?', actions: [open('How it works', 'how'), call] };

  let best: Reply | null = null;
  let bestScore = 0;
  for (const t of topics) {
    const score = t.keys.reduce((n, k) => n + (new RegExp(`(^|\\s)${k}(\\s|[?.!,]|$)`, 'u').test(q) ? k.length : 0), 0);
    if (score > bestScore) { bestScore = score; best = t.reply; }
  }
  return best ?? {
    text: 'That is a good one for our team. Book a call or send us a message and we will give you a considered answer.',
    actions: [call, open('Contact', 'call')],
  };
}

// Full AI: if the hosting has an API key configured, answers come from the live model.
// Otherwise this returns null and the built-in answers are used instead.
export async function aiReply(history: { role: 'user' | 'assistant'; content: string }[]): Promise<string | null> {
  try {
    const res = await fetch('/.netlify/functions/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-10) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : null;
  } catch {
    return null;
  }
}
