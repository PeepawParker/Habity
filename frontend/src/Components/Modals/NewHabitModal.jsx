import Button from "react-bootstrap/Button";
import FormModal from "./FormModal";
import { useFormik } from "formik";
import { handleNewHabit } from "../User Home Page/UserHomeFunctions/handleNewHabit";
import * as Yup from "yup";

// eslint-disable-next-line react/prop-types
function NewHabitModal({ show, handleClose, handleShow, setHabits }) {
  const formik = useFormik({
    initialValues: { dailyGoal: 1, variableTracking: "", habitName: "" },
    validationSchema: Yup.object({
      dailyGoal: Yup.number()
        .required("Required")
        .positive("Must be a positive number"),
      variableTracking: Yup.string().required("Required"),
      habitName: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      handleNewHabit(values, setHabits);
      handleClose();
      formik.resetForm();
    },
  });

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        New Habit
      </Button>

      <FormModal
        show={show}
        onHide={() => {
          handleClose();
          formik.resetForm();
        }}
        title="Habit Creator"
      >
        <form onSubmit={formik.handleSubmit} id="fooId">
          <input
            type="text"
            placeholder="Habit Name"
            name="habitName"
            value={formik.values.habitName}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <input
            type="number"
            placeholder="Daily Goal"
            name="dailyGoal"
            value={formik.values.dailyGoal}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <input
            type="text"
            placeholder="days, miles, pages, hours, etc..."
            name="variableTracking"
            value={formik.values.variableTracking}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <button onClick={handleClose}>Close</button>
          <button type="submit">Sign up</button>
        </form>
      </FormModal>
    </>
  );
}

export default NewHabitModal;
