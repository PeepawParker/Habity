import axios from "axios";

export async function deleteUserHabit(userHabitId) {
  try {
    await axios.delete("http://localhost:5000/api/v1/habits/delete", {
      data: { userHabitId },
      withCredentials: true,
    });
  } catch (err) {
    console.error("Error deleting habit data:", err);
    throw new Error("there was an error deleting habit");
  }
}
