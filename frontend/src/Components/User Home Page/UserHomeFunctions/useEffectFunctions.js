import axios from "axios";
import { dataActions } from "../../../store/dataStore";
import { checkUserCookies } from "../../../axiosRequests/Users/checkUserCookies";

// Confirm a user is defined before youre permitted to be on your userHome page and anything is loaded
export async function userDefined(
  navigate,
  username,
  authStatus,
  toast,
  dispatch,
  fetchHabits,
  setHabits
) {
  if (!authStatus) {
    const loginStatus = await checkUserCookies(dispatch);
    if (!loginStatus) {
      toast.error("Authentication Failed, Please log back in");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }
    if (!username) {
      if (loginStatus) {
        await fetchHabits(setHabits, loginStatus);
        return;
      }
      toast.error("Authentication Failed, Please log back in");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }
  }
  // the problem is right now if you fetch habits and only have the username it works
  fetchHabits(setHabits, username);
}

// optimistically update a habit's dataPoint that was just updated
export async function updateNewDataPoint(
  newDataPoint,
  userHabitId,
  setDataPoints,
  previousDataPointValue
) {
  if (newDataPoint !== null) {
    setDataPoints((prevDataPoints) => {
      const newDataPoints = { ...prevDataPoints };
      const date = new Date().toISOString().split("T")[0];

      if (newDataPoints[userHabitId]?.[date]?.[0]) {
        previousDataPointValue.current =
          newDataPoints[userHabitId][date][0].value;
        newDataPoints[userHabitId][date][0].value = +newDataPoint;
      }

      return newDataPoints;
    });
    return;
  }
}

// handle the aftermath of the dataPoint post request
export async function afterDataPost(
  reqStatus,
  toast,
  setDataPoints,
  userHabitId,
  previousDataPointValue,
  dispatch
) {
  if (reqStatus === "pending" || reqStatus === null) {
    return;
  }
  if (reqStatus === "success") {
    toast.success("Habit data successfully saved!");
  } else {
    // remove the optimistic data because the request failed

    setDataPoints((prevDataPoints) => {
      const date = new Date().toISOString().split("T")[0];
      const updatedDataPoints = { ...prevDataPoints };
      if (updatedDataPoints[userHabitId]?.[date]?.[0]) {
        updatedDataPoints[userHabitId][date][0].value =
          previousDataPointValue.current;
      }
      return updatedDataPoints;
    });
    toast.error("Failed to save habit data.");
  }
  dispatch(dataActions.removeNewDataPoint());
  return;
}

export async function makeHabitsPairs(habits, setHabitPairs) {
  function chunkArrayInGroups(arr, size) {
    let result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  setHabitPairs(chunkArrayInGroups(habits, 2));
}

export async function setHabitData(
  habit,
  numReturned,
  setDataPoints,
  setBiggestDataSet,
  fetchHabitData
) {
  let data;
  let fillerData;
  if (!habit.habit_name) {
    fillerData = {
      date: new Date().toISOString().split("T")[0],
      value: 0,
    };
  } else {
    data = await fetchHabitData(habit.user_habit_id, numReturned);
  }
  setDataPoints(fillerData || data[habit.user_habit_id]);
  setBiggestDataSet(fillerData || data[habit.user_habit_id]);
}

export async function updateHabitDataPoints(recentData) {
  let missingDates = [];
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  recentData.forEach((dataPoint) => {
    let dataDate = new Date(dataPoint.date);
    dataDate.setHours(0, 0, 0, 0);
    if (dataDate !== currentDate) {
      dataDate.setDate(dataDate.getDate() + 1);

      while (dataDate <= currentDate) {
        missingDates.push({
          date: new Date(dataDate).toISOString().split("T")[0],
          userHabitId: dataPoint.user_habit_id,
          progress: 0,
        });
        dataDate.setDate(dataDate.getDate() + 1);
      }
    }
  });

  if (missingDates.length > 0) {
    let sqlValues = missingDates
      .map(
        ({ userHabitId, date, progress }) =>
          `(${userHabitId}, '${date}', ${progress})`
      )
      .join(",");
    let sqlQuery = `INSERT INTO habit_data (user_habit_id, date, progress) VALUES ${sqlValues};`;

    try {
      await axios.post(
        "http://localhost:5000/api/v1/habits/fillMissingData",
        {
          sqlQuery,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Failed to insert missing data points:", error);
    }
  }
}

// fetches the last dataPoint added to the db, if it doesn't match the current date add points until it does
export async function fetchRecentHabitData(setLoading, habits) {
  setLoading(true);
  const recentHabitData = [];

  const habitPromises = habits.map(async (habit) => {
    try {
      const habitData = await axios.get(
        "http://localhost:5000/api/v1/habits/habit/lastDataPoint",
        {
          params: { userHabitId: habit.user_habit_id },
          withCredentials: true,
        }
      );
      recentHabitData.push(habitData.data.data[0]);
    } catch (err) {
      console.error("this aint working", err);
    }
  });
  await Promise.all(habitPromises);
  updateHabitDataPoints(recentHabitData);
  setLoading(false);
}

export async function getPrivacyStatusById(userId, setAccountPrivacy) {
  try {
    const accountPrivacy = await axios.get(
      `http://localhost:5000/api/v1/users/user/privacy/${userId}`,
      { withCredentials: true }
    );
    setAccountPrivacy(accountPrivacy.data.data[0].private);
  } catch (err) {
    console.error("cant get the accounts privacy status sorry", err);
  }
}
