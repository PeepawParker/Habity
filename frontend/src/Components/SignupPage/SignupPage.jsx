import SignUpForm from "../Modals/SignUpForm";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

export default function SignupPage() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <h1>This is the signup page</h1>

      <div>
        <SignUpForm
          show={show}
          handleShow={handleShow}
          handleClose={handleClose}
        />
      </div>
    </>
  );
}
