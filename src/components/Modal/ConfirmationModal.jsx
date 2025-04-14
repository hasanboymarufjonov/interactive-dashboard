import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./ConfirmationModal.module.css";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleConfirmClick = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 id="confirmation-modal-title" className={styles.modalHeader}>
          {title}
        </h2>
        <div className={styles.modalBody}>
          {children || "Are you sure you want to proceed?"}
        </div>
        <div className={styles.modalFooter}>
          <button
            className={`${styles.modalButton} ${styles.cancelButton}`}
            onClick={onClose}
            autoFocus
          >
            Cancel
          </button>
          <button
            className={`${styles.modalButton} ${styles.confirmButton}`}
            onClick={handleConfirmClick}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
};

export default ConfirmationModal;
