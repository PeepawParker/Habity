import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

import userReducer from "./userStore";
import dataReducer from "./dataStore";
import messageReducer from "./messageStore";
import chatReducer from "./chatStore";
import notificationReducer from "./notificationStore";
import sseReducer from "./sseStore";

// Middleware to log state after every update
const loggingMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Define the slices of the state you want to log
  const slicesToLog = ["chats"];

  const state = store.getState();
  const stateToLog = slicesToLog.reduce((acc, slice) => {
    if (state[slice] !== undefined) {
      acc[slice] = state[slice];
    }
    return acc;
  }, {});

  console.log("Updated state:", JSON.stringify(stateToLog, null, 2));

  return result;
};

// Middleware to prevent unauthorized state changes
const authMiddleware = () => (next) => (action) => {
  if (
    action.type === "user/login" &&
    action.payload.isAuthenticated !== undefined
  ) {
    console.warn("Unauthorized attempt to set isAuthenticated");
    return;
  }
  const result = next(action);
  return result;
};

// Persist configuration
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["user"],
};

// Combine reducers
const reducer = combineReducers({
  user: userReducer,
  data: dataReducer,
  messages: messageReducer,
  chats: chatReducer,
  notifications: notificationReducer,
  sse: sseReducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authMiddleware, loggingMiddleware),
});

export default store;
