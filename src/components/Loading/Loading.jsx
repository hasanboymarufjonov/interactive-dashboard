import React from "react";
import styles from "./Loading.module.css";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div
      className={styles.loadingContainer}
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.spinner} role="status" aria-label="Loading"></div>
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
};

export default Loading;
