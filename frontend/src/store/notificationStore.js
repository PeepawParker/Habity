import { createSlice } from "@reduxjs/toolkit";
const initialNotificationState = {
  // This is to keep track of notifications of unread chatIds in the NavBar
  unseenNotifications: {},
  unseenNotificationCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState: initialNotificationState,
  reducers: {
    setUnseenNotifications(state, action) {
      console.log("here these ones are, ", action.payload.unseenNotifications);
      return {
        ...state,
        unseenNotifications: action.payload.unseenNotifications,
      };
    },
    setUnseenNotificationCount(state, action) {
      return {
        ...state,
        unseenNotificationCount: action.payload.unseenNotificationCount,
      };
    },
    addUnseenNotification(state, action) {
      const { notificationId } = action.payload;
      return {
        ...state,
        unseenNotifications: {
          ...state.unseenNotifications,
          [notificationId]: notificationId,
        },
        unseenNotificationCount: state.unseenNotificationCount + 1,
      };
    },
    deleteUnseenNotification(state, action) {
      const { notificationId } = action.payload;
      if (
        Object.prototype.hasOwnProperty.call(
          state.unseenNotifications,
          notificationId
        )
      ) {
        // eslint-disable-next-line no-unused-vars
        const { [notificationId]: _, ...remainingNotifications } =
          state.unseenNotifications;

        console.log(
          "here is the item being removed",
          _,
          "here is the current redux object",
          remainingNotifications,
          "Here is the new count",
          state.unseenNotificationCount - 1
        );
        return {
          ...state,
          unseenNotifications: remainingNotifications,
          unseenNotificationCount: state.unseenNotificationCount - 1,
        };
      } else {
        console.log("this aint working no mo");
      }
      return state;
    },
    addUnseenNotificationCount(state) {
      return {
        ...state,
        unseenNotificationCount: state.unseenNotificationCount + 1,
      };
    },
    subtractUnseenNotificationCount(state) {
      return {
        ...state,
        unseenNotificationCount: state.unseenNotificationCount - 1,
      };
    },
    resetNotifications() {
      return initialNotificationState;
    },
  },
});

export const notificationActions = notificationSlice.actions;

export default notificationSlice.reducer;
