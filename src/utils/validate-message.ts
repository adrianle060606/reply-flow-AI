import { extensionRequestSchema, type ExtensionRequest } from '@/types/messages';

export function parseExtensionRequest(input: unknown): ExtensionRequest {
  return extensionRequestSchema.parse(input);
}

export function isExtensionRequest(input: unknown): input is ExtensionRequest {
  return extensionRequestSchema.safeParse(input).success;
}
