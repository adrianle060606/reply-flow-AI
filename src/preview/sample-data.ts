import type { ConversationContext } from '@/types/conversation';

export const SAMPLE_CONVERSATIONS: ConversationContext[] = [
  {
    platformId: 'gmail',
    platformName: 'Gmail',
    conversationId: 'gmail:priya-q3',
    title: 'Q3 internship project sync',
    participants: ['Priya Shah', 'Adrian Le'],
    canInsert: true,
    url: 'https://mail.google.com/mail/u/0/#inbox/thread-priya',
    messages: [
      {
        id: '1',
        author: 'Priya Shah',
        role: 'other',
        body: 'Hey Adrian, thanks for sending the design doc. The plugin architecture looks solid.',
      },
      {
        id: '2',
        author: 'Adrian Le',
        role: 'self',
        body: 'Appreciate you reading it so quickly. Happy to walk through the registry and insert path whenever.',
      },
      {
        id: '3',
        author: 'Priya Shah',
        role: 'other',
        body: 'Two questions: can we lazy-load adapters, and should API keys stay in the service worker only? Also, are you free Thursday 3pm PT to demo?',
      },
    ],
  },
  {
    platformId: 'slack',
    platformName: 'Slack',
    conversationId: 'slack:eng-oncall',
    title: '#eng-oncall',
    participants: ['Marcus Chen', 'Adrian Le'],
    canInsert: true,
    url: 'https://app.slack.com/client/T/C/eng-oncall',
    messages: [
      {
        id: '1',
        author: 'Marcus Chen',
        role: 'other',
        body: 'The content script is firing twice on Gmail compose. Repro: open a reply, switch labels, come back.',
      },
      {
        id: '2',
        author: 'Adrian Le',
        role: 'self',
        body: 'I think the SPA route change remounts #main. I can gate on a conversation fingerprint.',
      },
      {
        id: '3',
        author: 'Marcus Chen',
        role: 'other',
        body: 'Can you put a patch up before standup? Keep it tiny.',
      },
    ],
  },
  {
    platformId: 'linkedin',
    platformName: 'LinkedIn',
    conversationId: 'linkedin:recruiter',
    title: 'Ava Patel',
    participants: ['Ava Patel', 'Adrian Le'],
    canInsert: true,
    url: 'https://www.linkedin.com/messaging/thread/ava',
    messages: [
      {
        id: '1',
        author: 'Ava Patel',
        role: 'other',
        body: "Loved the ReplyMe writeup — the Open/Closed adapter story is exactly the kind of intern work we look for. Are you open to a 30-minute chat next week?",
      },
    ],
  },
];
