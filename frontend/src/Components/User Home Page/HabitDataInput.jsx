import { useState } from "react";
import { useDispatch } from "react-redux";
import { dataActions } from "../../store/dataStore";
import handleDataSubmit from "./UserHomeFunctions/handleDataSubmit";

export default function HabitDataInput({
  username,
  habitName,
  habitVar,
  userHabitId,
  setDataPoints,
}) {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState();

  const handleChange = (e) => {
    setProgress(e.target.value);
  };

  return (
    <>
      <input
        className="InputBox"
        placeholder="please"
        onChange={handleChange}
      />
      <button
        onClick={() => {
          dispatch(
            dataActions.updateStatus({
              dataPoint: progress,
              userHabitId,
              reqStatus: "pending",
            })
          );
          handleDataSubmit(
            setIsSubmitting,
            setDataPoints,
            progress,
            username,
            habitName,
            habitVar,
            userHabitId,
            dispatch,
            dataActions
          );
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </>
  );
}
