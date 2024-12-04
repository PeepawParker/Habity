import { createSlice } from "@reduxjs/toolkit";

// the message itself will be {message_data, sender_id, time_sent}

const initialMessageState = {
  messages: [],
};

const messageSlice = createSlice({
  name: "messages",
  initialState: initialMessageState,
  reducers: {
    addMessage(state, action) {
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    },
    addMessages(state, action) {
      return {
        ...state,
        messages: [...action.payload],
      };
    },
    removeMessage(state) {
      return {
        ...state,
        messages: state.messages.slice(0, -1),
      };
    },
    resetMessages() {
      return initialMessageState;
    },
  },
});

export const messageActions = messageSlice.actions;

export default messageSlice.reducer;
