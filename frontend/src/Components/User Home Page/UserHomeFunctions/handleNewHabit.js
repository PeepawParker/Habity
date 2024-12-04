import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

// Optimistically updates when a new habit is added

export async function handleNewHabit(newHabit, setHabits) {
  let revertHabits;
  setHabits((prevHabits) => {
    revertHabits = prevHabits;
    if (
      prevHabits.length > 0 &&
      prevHabits[prevHabits.length - 1].length === 1
    ) {
      const allButLast = prevHabits.slice(0, -1);
      const lastItem = [...prevHabits[prevHabits.length - 1], { newHabit }];
      return [...allButLast, lastItem];
    }

    const finalNewHabit = { newHabit };
    return [...prevHabits, finalNewHabit];
  });

  try {
    const habitData = await axios.post(
      "http://localhost:5000/api/v1/habits",
      newHabit,
      {
        withCredentials: true,
      }
    );

    const habit = await axios.get(
      "http://localhost:5000/api/v1/habits/userHabitRow",
      {
        params: {
          userHabitId: habitData.data.data.user_habit_id,
        },
        withCredentials: true,
      }
    );

    setHabits((prevHabits) => {
      const allButLast = prevHabits.slice(0, -1);

      return [...allButLast, habit.data.data];
    });
    toast.success("New Habit Being Tracked");
  } catch (err) {
    // revert habits and data back to the original values
    setHabits(revertHabits);
    const errorMsg = err.response
      ? err.response.data.message
      : "New Habit Failed";
    toast.error(errorMsg);
  }
}
