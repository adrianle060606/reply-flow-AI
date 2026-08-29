# ReplyMe Architecture

This document records the major design decisions. Code follows this document; the document is not generated after the fact.

## Why a Chrome extension

ReplyMe has to read the live DOM of Gmail, WhatsApp Web, Discord, Slack, LinkedIn, Messenger, X, and Google Messages. A content script with host-level adapters is the only practical way to do that without partner APIs.

The product is a **communication copilot**, not a single-site reply button. The architecture therefore treats platforms and AI vendors as plugins, not `if (hostname)` switches.

## Clean architecture mapping

```
Presentation     popup/  options/  components/  hooks/  content/ (DOM host)
Application      services/  background/ (use-case orchestration)
Domain           types/  models/  constants/
Infrastructure   adapters/  ai/  storage/  utils/chrome
```

Rules:

- UI never calls an HTTP API or reads `chrome.storage` secrets.
- Use cases never import React or DOM APIs.
- Adapters never import UI or AI providers.
- AI providers never import platform adapters.
- The background service worker is the only process that holds API keys.

## Plugin discovery (Open/Closed)

Adding Gmail-like support for a new site must not edit a central switch statement.

Each platform lives in `src/adapters/<id>/` and exports:

```ts
export const meta: PlatformMeta;
export function createAdapter(): MessagingPlatform;
```

`import.meta.glob('./*/index.ts', { eager: true })` in the registry collects every folder automatically. A new adapter is a new folder. The Vite extension build regenerates `manifest.json` `content_scripts.matches` from those `meta.matches` values, so the manifest is not hand-edited either.

AI vendors use the same pattern under `src/ai/providers/*/`.

## Why the background script owns AI

Manifest V3 content scripts run in the page’s world (isolated, but still on the host origin). Putting an OpenAI key there would leak it to any XSS on mail.google.com.

Flow:

```
Popup  --runtime.sendMessage-->  Service worker
                                      |
                                      | tabs.sendMessage
                                      v
                                 Content script
                                      |
                                      v
                                   Adapter
```

1. Popup asks for the active conversation.
2. Service worker forwards to the content script.
3. Content script resolves the adapter for `location.href` and extracts messages.
4. Popup asks the worker to generate replies.
5. Worker loads settings + secret, runs the use case, returns cards.
6. Insert goes back through the content script so the adapter can type into the real composer.

Every message is a discriminated union validated with Zod before handling.

## MessagingPlatform contract

```ts
interface MessagingPlatform {
  detectConversation(): ConversationContext | null;
  extractMessages(limit?: number): Message[];
  findInputBox(): HTMLElement | null;
  insertReply(text: string): Promise<boolean>;
  getPlatformName(): string;
}
```

A shared `BasePlatformAdapter` implements detect/extract/insert using template methods (`conversationRoot`, `parseMessages`, `composeCandidates`). Site-specific code is selectors + parsing. Insert uses native value setters and `InputEvent` so React/Lexical/Slate composers accept the text.

Adapters fail closed: if the DOM shifted, they return `null` / `[]` / `false` instead of throwing into the host page.

## AIProvider contract

```ts
interface AIProvider {
  generateReply(request: GenerateReplyRequest): Promise<GeneratedReply[]>;
  summarize(conversation: ConversationContext): Promise<string>;
  rewrite(text: string, instruction: RewriteInstruction): Promise<string>;
}
```

Follow-ups, icebreakers, grammar, translate, tone, shorten, expand, and explain are **application services** that call `generateReply` or `rewrite` with different instructions. That keeps the vendor interface small (Interface Segregation) while still shipping the copilot features.

`OpenAICompatibleProvider` covers OpenAI, OpenRouter, DeepSeek, and Ollama (one HTTP shape). Gemini and Claude have their own HTTP clients. `MockProvider` makes the UI demoable with no key.

## Storage

| Store            | chrome.storage | Contents                                      |
| ---------------- | -------------- | --------------------------------------------- |
| `settings-store` | `sync`         | provider, model, temperature, tone, theme     |
| `secret-store`   | `local`        | API keys, never synced                        |
| `memory-store`   | `local`        | per-conversation summaries (copilot memory)   |
| `cache-store`    | `session`      | hashed prompt → replies, TTL, rate-limit data |

## Presentation

Popup and options are React + Tailwind. They talk to a `ChromeRuntimePort` port. In the hosted preview, a `preview/` chrome mock implements the same port so the UI is a real app without loading an unpacked extension.

Components stay small. Logic lives in hooks (`useConversation`, `useReplies`, `useSettings`, `useTheme`).

## Performance

- One content script, all adapters eager-bundled (they are selector tables, not React). Dynamic `import()` of adapters would require `web_accessible_resources` on every host.
- AI providers load only in the worker.
- Generate-replies is **one** model call for every selected tone (JSON array), not N calls.
- Debounced conversation refresh.
- Response cache keyed by conversation hash + tones + model.

## Security

- Secrets never in `sync`, never in content scripts, never logged.
- Zod on every extension message (`text` max length, allowed enums).
- Tokenless mock provider by default.
- HTTP providers map 429 to a typed `RateLimitedError` and back off.
- Insert path does not `eval` and does not inject HTML — text only.
