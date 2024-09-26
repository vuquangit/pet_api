import { FindMessageParams } from './types';

export const buildFindMessageParams = (params: FindMessageParams) => ({
  id: params.messageId,
  // author: { id: params.userId },
  // conversation: { id: params.conversationId },
  author_id: params.userId,
  conversation_id: params.conversationId,
});
