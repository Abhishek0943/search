import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ChatItem = {
  unread_count: number | string;
  id: number;
  logo: string;
  name?: string;
  last_message?: string;
  last_message_at?: string;
  attachment_type?: string;
};

interface ChatState {
  data: ChatItem[];
  active: number;
}

const initialState: ChatState = {
  data: [],
  active: 0,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatData(state, { payload }: PayloadAction<ChatItem[]>) {
      state.data = payload;
    },
    setActiveChat(state, { payload }: PayloadAction<number>) {
      state.active = payload;
    },
    updateChatMessage(
      state,
      { payload }: PayloadAction<{ companyId: number; lastMessage: string; active: number }>
    ) {
      state.data = state.data.map(k => {
        if (k.id !== payload.companyId) return k;
        return {
          ...k,
          last_message: payload.lastMessage,
          unread_count:
            payload.active === k.id
              ? 0
              : (Number(k?.unread_count) || 0) + 1,
        };
      });
    },
    clearUnreadCount(state, { payload }: PayloadAction<number>) {
      state.data = state.data.map(k =>
        k.id === payload ? { ...k, unread_count: 0 } : k
      );
    },
  },
});

export const { setChatData, setActiveChat, updateChatMessage, clearUnreadCount } =
  chatSlice.actions;
export default chatSlice.reducer;
