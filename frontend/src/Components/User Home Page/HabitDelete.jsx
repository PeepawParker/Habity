import handleHabitDelete from "./UserHomeFunctions/handleHabitDelete";
export default function HabitDelete({ userHabitId, setHabits }) {
  return (
    <>
      <button onClick={() => handleHabitDelete(setHabits, userHabitId)}>
        Delete
      </button>
    </>
  );
}
