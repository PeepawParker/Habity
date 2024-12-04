import { createSlice } from "@reduxjs/toolkit";

// the message itself will be {message_data, sender_id, time_sent}

const initialSSEState = {
  sseConnection: false,
};

const sseSlice = createSlice({
  name: "sse",
  initialState: initialSSEState,
  reducers: {
    sseConnected(state) {
      return {
        ...state,
        sseConnection: true,
      };
    },
    sseDisconnected(state) {
      return {
        ...state,
        sseConnection: false,
      };
    },
    resetsse() {
      return initialSSEState;
    },
  },
});

export const sseActions = sseSlice.actions;

export default sseSlice.reducer;
