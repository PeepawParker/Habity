import { createSlice } from "@reduxjs/toolkit";

const binarySearch = (arr, target) => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid].time_sent === target) {
      return mid;
    }
    if (arr[mid].time_sent < target) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return -1;
};

const initialChatState = {
  // This is to keep track of notifications of unread chatIds in the NavBar
  unreadChatNotification: null,
  unreadChatReqNotification: null,
  unseenChatReq: false,

  recentChats: { history: [] },
  recentChatReqs: { history: [] },
  chatFetchStatus: "not_fetched",
  chatReqFetchStatus: "not_fetched",

  // This is for the message queue when sitting on the /messages page to ensure ui updates when messages are received
  chatQueue: [],
  chatReqQueue: [],
  curChatToUpdate: null,
  curChatReqToUpdate: null,
  queuedChats: {},
  queuedChatReqs: {},
};

const chatSlice = createSlice({
  name: "chats",
  initialState: initialChatState,
  reducers: {
    readRecentChat(state, action) {
      const { chatId } = action.payload;
      if (state.recentChatReqs[chatId]) {
        return {
          ...state,
          recentChatReqs: {
            ...state.recentChatReqs,
            [chatId]: {
              ...state.recentChatReqs[chatId],
              read_status: true,
            },
          },
        };
      } else if (state.recentChats[chatId]) {
        return {
          ...state,
          recentChats: {
            ...state.recentChats,
            [chatId]: {
              ...state.recentChats[chatId],
              read_status: true,
            },
          },
        };
      }
      return state;
    },

    setUnreadChatNotification(state, action) {
      return {
        ...state,
        unreadChatNotification: +action.payload.unreadStatus,
      };
    },

    setUnreadChatReqNotification(state, action) {
      return {
        ...state,
        unreadChatReqNotification: +action.payload.unreadStatus,
      };
    },

    updateRecentChatReqs(state, action) {
      const messages = action.payload.messages;
      let updatedHistory = [...(state.recentChatReqs.history || [])];
      let updatedRecentChatReqs = { ...state.recentChatReqs };

      messages.forEach((message) => {
        const chatId = message.chat_id;
        const newHistoryEntry = {
          chat_id: chatId,
          time_sent: message.time_sent,
        };

        const oldMessage = updatedRecentChatReqs[chatId];
        if (oldMessage) {
          const index = binarySearch(updatedHistory, oldMessage.time_sent);
          if (index !== -1) {
            updatedHistory.splice(index, 1);
          }
        }

        // Insert the new entry at the correct position
        const insertIndex = updatedHistory.findIndex(
          (entry) => entry.time_sent < message.time_sent
        );
        if (insertIndex === -1) {
          updatedHistory.push(newHistoryEntry);
        } else {
          updatedHistory.splice(insertIndex, 0, newHistoryEntry);
        }

        updatedRecentChatReqs[chatId] = message;
      });

      updatedRecentChatReqs.history = updatedHistory;

      return {
        ...state,
        recentChatReqs: updatedRecentChatReqs,
      };
    },

    updateRecentChats(state, action) {
      const messages = action.payload.messages;
      let updatedHistory = [...(state.recentChats.history || [])];
      let updatedRecentChats = { ...state.recentChats };

      messages.forEach((message) => {
        const chatId = message.chat_id;
        const newHistoryEntry = {
          chat_id: chatId,
          time_sent: message.time_sent,
        };

        const oldMessage = updatedRecentChats[chatId];
        if (oldMessage) {
          const index = binarySearch(updatedHistory, oldMessage.time_sent);
          if (index !== -1) {
            updatedHistory.splice(index, 1);
          }
        }

        // Insert the new entry at the correct position
        const insertIndex = updatedHistory.findIndex(
          (entry) => entry.time_sent < message.time_sent
        );
        if (insertIndex === -1) {
          updatedHistory.push(newHistoryEntry);
        } else {
          updatedHistory.splice(insertIndex, 0, newHistoryEntry);
        }

        updatedRecentChats[chatId] = message;
      });

      updatedRecentChats.history = updatedHistory;

      return {
        ...state,
        recentChats: updatedRecentChats,
      };
    },

    setRecentChats(state, action) {
      return {
        ...state,
        recentChats: action.payload.recentChats,
        chatFetchStatus: "fetched",
      };
    },
    setRecentChatReqs(state, action) {
      return {
        ...state,
        recentChatReqs: action.payload.recentChats,
        chatReqFetchStatus: "fetched",
      };
    },

    respondToChatReq(state, action) {
      const message = action.payload.message;
      const chatId = +message.chat_id;
      // eslint-disable-next-line no-unused-vars
      const { [chatId]: removedChat, ...remainingChatReqs } =
        state.recentChatReqs;

      const updatedChatReqsHistory = (
        state.recentChatReqs.history || []
      ).filter((entry) => entry.chat_id !== chatId);

      const updatedRecentChats = {
        [chatId]: message,
        ...state.recentChats,
      };

      const newHistoryEntry = {
        chat_id: chatId,
        time_sent: message.time_sent,
      };

      const updatedChatsHistory = [
        newHistoryEntry,
        ...(state.recentChats.history || []).filter(
          (entry) => entry.chat_id !== chatId
        ),
      ];

      return {
        ...state,
        recentChatReqs: {
          ...remainingChatReqs,
          history: updatedChatReqsHistory,
        },
        recentChats: {
          ...updatedRecentChats,
          history: updatedChatsHistory,
        },
      };
    },

    newUnseenChatReq(state) {
      return {
        ...state,
        unseenChatReq: true,
      };
    },

    resetChats() {
      return initialChatState;
    },
    addToQueue(state, action) {
      const chatId = action.payload.chatId;
      if (
        !state.queuedChats[chatId] &&
        state.chatFetchStatus !== "not_fetched"
      ) {
        return {
          ...state,
          queuedChats: {
            ...state.queuedChats,
            [chatId]: true,
          },
          chatQueue: [...state.chatQueue, chatId],
          curChatToUpdate:
            state.chatQueue.length === 0 ? chatId : state.curChatToUpdate,
        };
      }
      return state;
    },
    addToChatReqQueue(state, action) {
      const chatId = action.payload.chatId;
      if (
        !state.queuedChatReqs[chatId] &&
        state.chatReqFetchStatus !== "not_fetched"
      ) {
        return {
          ...state,
          queuedChatReqs: {
            ...state.queuedChatReqs,
            [chatId]: true,
          },
          chatReqQueue: [...state.chatReqQueue, chatId],
          curChatReqToUpdate:
            state.chatReqQueue.length === 0 ? chatId : state.curChatReqToUpdate,
        };
      }
      return state;
    },

    removeFromRecentChatReqs(state, action) {
      const chatId = +action.payload.chatId;

      // eslint-disable-next-line no-unused-vars
      const { [chatId]: removedChat, ...remainingChats } = state.recentChatReqs;

      const updatedHistory = state.recentChatReqs.history.filter((entry) => {
        const shouldInclude = entry.chat_id !== chatId;
        return shouldInclude;
      });

      return {
        ...state,
        recentChatReqs: {
          ...remainingChats,
          history: updatedHistory,
        },
      };
    },

    deleteQueue(state) {
      return {
        ...state,
        curChatToUpdate: null,
        chatQueue: [],
        queuedChats: {},
      };
    },

    deleteReqQueue(state) {
      return {
        ...state,
        curChatReqToUpdate: null,
        chatReqQueue: [],
        queuedChatReqs: {},
      };
    },

    removeFromQueue(state) {
      const removedChatId = state.curChatToUpdate;
      const updatedQueue = state.chatQueue.slice(1);
      const updatedQueuedChats = Object.keys(state.queuedChats).reduce(
        (acc, key) => {
          if (key !== removedChatId) {
            acc[key] = state.queuedChats[key];
          }
          return acc;
        },
        {}
      );

      return {
        ...state,
        queuedChats: updatedQueuedChats,
        chatQueue: updatedQueue,
        curChatToUpdate: updatedQueue.length > 0 ? updatedQueue[0] : null,
      };
    },
    removeFromChatReqQueue(state) {
      const removedChatId = state.curChatReqToUpdate;
      const updatedQueue = state.chatReqQueue.slice(1);
      const updatedQueuedChatReqs = Object.keys(state.queuedChatReqs).reduce(
        (acc, key) => {
          if (key !== removedChatId) {
            acc[key] = state.queuedChatReqs[key];
          }
          return acc;
        },
        {}
      );

      return {
        ...state,
        queuedChatReqs: updatedQueuedChatReqs,
        chatReqQueue: updatedQueue,
        curChatReqToUpdate: updatedQueue.length > 0 ? updatedQueue[0] : null,
      };
    },
  },
});

export const chatActions = chatSlice.actions;

export default chatSlice.reducer;
