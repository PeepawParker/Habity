import Button from "react-bootstrap/Button";
import FormModal from "./FormModal";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { userActions } from "../../store/userStore";

// eslint-disable-next-line react/prop-types
function SignUpForm({ show, handleClose, handleShow }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Required"),
      username: Yup.string()
        .min(4, "Username must be at least 4 characters long")
        .required("Required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters long")
        .required("Required"),
      passwordConfirm: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/v1/users/signup",
          values,
          { withCredentials: true }
        );
        if (response.status === 200) {
          dispatch(
            userActions.login({
              username: response.data.data.user.username,
              userId: response.data.data.user.user_id,
              privateStatus: response.data.data.user.private,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            })
          );
        }
        handleClose();
        formik.resetForm();
        navigate("/userhome");
        toast.success("Signed Up Successfully!");
      } catch (err) {
        const errorMsg = err.response
          ? err.response.data.message
          : "Signup Failed";
        toast.error(errorMsg);
        dispatch(userActions.loginFail(errorMsg));
      }
    },
  });

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Sign Up
      </Button>

      <FormModal
        show={show}
        onHide={() => {
          handleClose();
          formik.resetForm();
        }}
        title="Sign Up"
      >
        <form onSubmit={formik.handleSubmit} id="fooId">
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formik.values.email}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={formik.values.username}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formik.values.password}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            name="passwordConfirm"
            value={formik.values.passwordConfirm}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          />
          <button type="button" onClick={handleClose}>
            Close
          </button>
          <button type="submit">Sign up</button>
        </form>
      </FormModal>
    </>
  );
}

export default SignUpForm;
