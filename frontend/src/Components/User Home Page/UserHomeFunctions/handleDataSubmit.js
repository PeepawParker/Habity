import { postHabitData } from "../../../axiosRequests/HabitData/postHabitData";

export default async function handleDataSubmit(
  setIsSubmitting,
  setDataPoints,
  progress,
  username,
  habitName,
  habitVar,
  userHabitId,
  dispatch,
  dataActions
) {
  let prevValue = 0;
  const date = new Date().toISOString().split("T")[0];
  setIsSubmitting(true);
  try {
    setDataPoints((prevData) => {
      const updatedData = { ...prevData };
      prevValue = updatedData[date]?.value ?? 0;
      const newPoint = { date: date, value: progress };
      updatedData[date] = newPoint;
      return updatedData;
    });
    await postHabitData(
      {
        username,
        habitName,
        habitVar,
        progress,
        date,
      },
      dispatch
    );
    dispatch(dataActions.updateStatus({ reqStatus: "success", userHabitId }));
  } catch (error) {
    setDataPoints((prevData) => {
      const updatedData = { ...prevData };
      const newPoint = { date: date, value: prevValue };
      updatedData[date] = newPoint;
      return updatedData;
    });
    dispatch(dataActions.updateStatus({ reqStatus: "fail", userHabitId }));
  }
  setIsSubmitting(false);
}
