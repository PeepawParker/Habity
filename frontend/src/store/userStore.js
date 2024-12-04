import { createSlice } from "@reduxjs/toolkit";

const initialUserState = {
  username: null,
  userId: null,
  isAuthenticated: false,
  privateStatus: null,
  messageRequests: false,
  timeZone: null,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    login(state, action) {
      return {
        ...state,
        username: action.payload.username,
        userId: action.payload.userId,
        isAuthenticated: true,
        privateStatus: action.payload.privateStatus,
        timeZone: action.payload.timeZone,
        error: null,
      };
    },
    loginFail(state, action) {
      return {
        ...state,
        username: null,
        userId: null,
        isAuthenticated: false,
        privateStatus: null,
        timeZone: null,
        error: action.payload,
      };
    },
    setMessageRequestsTrue(state) {
      return {
        ...state,
        messageRequests: true,
      };
    },
    setMessageRequestsFalse(state) {
      return {
        ...state,
        messageRequests: false,
      };
    },
    setPrivacy(state, action) {
      return {
        ...state,
        privateStatus: action.payload.privateStatus,
      };
    },
    resetUser() {
      return initialUserState;
    },
  },
});

export const userActions = userSlice.actions;

export default userSlice.reducer;
