import type { ExtensionRequest, ExtensionResponse } from '@/types/messages';
import { AppError } from '@/utils/errors';

export async function sendMessage<T>(request: ExtensionRequest): Promise<T> {
  if (!chrome?.runtime?.sendMessage) {
    throw new AppError('NO_RUNTIME', 'ReplyMe is not running inside Chrome.');
  }
  const response = (await chrome.runtime.sendMessage(request)) as ExtensionResponse<T> | undefined;
  if (!response) {
    throw new AppError('NO_RUNTIME', 'The extension worker did not respond.');
  }
  if (!response.ok) {
    throw new AppError(response.error.code, response.error.message);
  }
  return response.data;
}
