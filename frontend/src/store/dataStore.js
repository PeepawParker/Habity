import { createSlice } from "@reduxjs/toolkit";

const initialDataState = {
  habits: null,
  habitsData: null,
  newDataPoint: null,
  userHabitId: null,
  followingIds: {},
  followerCount: 0,
  followingCount: 0,
  reqStatus: null,
};

const dataSlice = createSlice({
  name: "data",
  initialState: initialDataState,
  reducers: {
    updateHabits(state, action) {
      return {
        ...state,
        habits: action.payload.habits,
      };
    },
    updateHabitsData(state, action) {
      return {
        ...state,
        habitsData: action.payload.habitsData,
      };
    },
    updateNewDataPoint(state, action) {
      return {
        ...state,
        newDataPoint: action.payload.dataPoint,
        userHabitId: action.payload.userHabitId,
        reqStatus: action.payload.reqStatus,
      };
    },
    removeNewDataPoint(state) {
      return {
        ...state,
        newDataPoint: null,
        userHabitId: null,
        reqStatus: null,
      };
    },
    updateStatus(state, action) {
      return {
        ...state,
        reqStatus: action.payload.reqStatus,
      };
    },
    updateFollowCounts(state, action) {
      return {
        ...state,
        followerCount: +action.payload.followerCount,
        followingCount: +action.payload.followingCount,
      };
    },
    updateFollowingIds(state, action) {
      return {
        ...state,
        followingIds: action.payload.followingIds,
      };
    },
    addFollowingId(state, action) {
      const { followedId } = action.payload;
      return {
        ...state,
        followingIds: {
          ...state.followingIds,
          [followedId]: { followedId, private: true, pending_status: true },
        },
      };
    },
    deleteFollowingId(state, action) {
      const { followedId } = action.payload;
      // eslint-disable-next-line no-unused-vars
      const { [followedId]: _, ...remainingFollowingIds } = state.followingIds;
      return {
        ...state,
        followingIds: remainingFollowingIds,
      };
    },
    addFollowerCount(state) {
      return {
        ...state,
        followerCount: state.followerCount + 1,
      };
    },
    addFollowingCount(state, action) {
      let { followedId, private_status } = action.payload;
      if (!private_status) {
        private_status = false;
      }
      return {
        ...state,
        followingCount: state.followingCount + 1,
        followingIds: {
          ...state.followingIds,
          [followedId]: { followedId, private_status, pending_status: false },
        },
      };
    },
    subtractFollowerCount(state) {
      return {
        ...state,
        followerCount: state.followerCount - 1,
      };
    },
    subtractFollowingCount(state, action) {
      const { followedId } = action.payload;
      // eslint-disable-next-line no-unused-vars
      const { [followedId]: _, ...remainingFollowingIds } = state.followingIds;
      return {
        ...state,
        followingCount: state.followingCount - 1,
        followingIds: remainingFollowingIds,
      };
    },
    resetData() {
      return initialDataState;
    },
  },
});

export const dataActions = dataSlice.actions;

export default dataSlice.reducer;
