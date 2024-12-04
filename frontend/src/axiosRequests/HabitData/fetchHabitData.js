import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export async function fetchHabitData(userHabitId, numReturned) {
  try {
    if (numReturned) {
      const habitData = await axios.get(
        `http://localhost:5000/api/v1/habits/habitData/${numReturned}`,
        { params: { userHabitId }, withCredentials: true }
      );
      return habitData.data.data;
    } else {
      const habitData = await axios.get(
        `http://localhost:5000/api/v1/habits/habitData`,
        { params: { userHabitId }, withCredentials: true }
      );
      return habitData.data.data;
    }
  } catch (err) {
    const errorMsg = err.response.data.message;
    toast.error(
      errorMsg ||
        "There was a problem retrieving your habit Data, please try again later"
    );
  }
}
