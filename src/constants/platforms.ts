export const PlatformId = {
  Gmail: 'gmail',
  Whatsapp: 'whatsapp',
  Discord: 'discord',
  Slack: 'slack',
  Linkedin: 'linkedin',
  Messenger: 'messenger',
  Twitter: 'twitter',
  GoogleMessages: 'google-messages',
} as const;

export type PlatformId = (typeof PlatformId)[keyof typeof PlatformId];
