// FormModal.js
import Modal from "react-bootstrap/Modal";

// eslint-disable-next-line react/prop-types
function FormModal({ show, onHide, title, children }) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
}

export default FormModal;
