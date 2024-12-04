import { deleteUserHabit } from "../../../axiosRequests/Habits/deleteUserHabit";

export default async function handleHabitDelete(setHabits, userHabitId) {
  let revertHabits;
  setHabits((prevHabits) => {
    revertHabits = prevHabits;

    const updatedHabits = prevHabits.filter(
      (habit) => habit.user_habit_id !== userHabitId
    );
    if (updatedHabits.length === 0) {
      return [];
    }
    return updatedHabits;
  });
  try {
    await deleteUserHabit(userHabitId);
  } catch (error) {
    setHabits(revertHabits);
  }
}
