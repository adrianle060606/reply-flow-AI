import { STORAGE_KEYS } from '@/constants/storage';
import { createChromeStore, type KeyValueStore } from '@/storage/chrome-store';

export interface ConversationMemoryEntry {
  conversationId: string;
  summary: string;
  updatedAt: number;
}

interface MemoryFile {
  entries: Record<string, ConversationMemoryEntry>;
}

export class MemoryStore {
  constructor(private readonly store: KeyValueStore = createChromeStore('local')) {}

  async get(conversationId: string): Promise<string | undefined> {
    const file = await this.read();
    return file.entries[conversationId]?.summary;
  }

  async put(conversationId: string, summary: string): Promise<void> {
    const file = await this.read();
    file.entries[conversationId] = {
      conversationId,
      summary,
      updatedAt: Date.now(),
    };
    const ids = Object.keys(file.entries);
    if (ids.length > 80) {
      const oldest = ids
        .map((id) => file.entries[id])
        .filter((entry): entry is ConversationMemoryEntry => Boolean(entry))
        .sort((a, b) => a.updatedAt - b.updatedAt);
      for (const entry of oldest.slice(0, ids.length - 80)) {
        delete file.entries[entry.conversationId];
      }
    }
    await this.store.set(STORAGE_KEYS.memory, file);
  }

  private async read(): Promise<MemoryFile> {
    return (await this.store.get<MemoryFile>(STORAGE_KEYS.memory)) ?? { entries: {} };
  }
}
