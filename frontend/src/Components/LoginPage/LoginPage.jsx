import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userActions } from "../../store/userStore";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(4, "Username must be at least 4 characters long")
        .required("Required"),
      password: Yup.string()
        .min(8, "Password must be atleast 8 characters long")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/v1/users/login",
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

        navigate("/userhome");
        toast.success("Logged in successfully");
      } catch (err) {
        const errorMsg = err.response
          ? err.response.data.message
          : "Login failed";
        toast.error(errorMsg);
        dispatch(userActions.loginFail(errorMsg));
      }
    },
  });

  return (
    <>
      <h1>This is the login page</h1>
      <form onSubmit={formik.handleSubmit}>
        <input
          type="text"
          placeholder="email/username"
          name="username"
          id="username"
          value={formik.values.username}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
        ></input>
        {formik.touched.username && formik.errors.username ? (
          <div style={{ color: "red" }}>{formik.errors.username}</div>
        ) : null}
        <input
          type="password"
          placeholder="password"
          name="password"
          id="password"
          value={formik.values.password}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
        ></input>
        {formik.touched.password && formik.errors.password ? (
          <div style={{ color: "red" }}>{formik.errors.password}</div>
        ) : null}
        <button type="submit">Login</button>
      </form>
    </>
  );
}
