import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export async function fetchHabits(setHabits, username) {
  try {
    const habits = await axios.get(
      `http://localhost:5000/api/v1/habits/user/${username}`,
      {
        withCredentials: true,
      }
    );
    setHabits(habits.data.data);
  } catch (err) {
    // const errorMsg = err.response.data.message;
    toast.error(
      // errorMsg ||
      "There was a problem retrieving your habits, refresh page to try again"
    );
  }
}
