import axios from "axios";
import { dataActions } from "../../store/dataStore";

export async function postHabitData(data, dispatch) {
  // you changed this from userName to username so if this starts erroring for stuff thats why
  const userName = data.username;
  const habitName = data.habitName;
  const habitVar = data.habitVar;
  const progress = data.progress;

  try {
    await axios.post(
      "http://localhost:5000/api/v1/habits/data",
      { userName, habitName, habitVar, progress },
      { withCredentials: true }
    );
    dispatch(dataActions.updateStatus({ reqStatus: "success" }));
  } catch (err) {
    console.error("Error posting habit data:", err);
    throw err;
  }
}
