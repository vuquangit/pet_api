export interface CreateConversationParams {
  // username: string;
  user_id: string;
  message: string;
}

export interface GetConversationMessagesParams {
  id: string;
  limit: number;
}

export interface UpdateConversationParams
  extends Partial<{
    id: string;
    // lastMessageSent: Message;
    lastMessageSent_id: string | null;
  }> {
  //
}
