import PropTypes from "prop-types";
import styles from "./Controls.module.css";
const Controls = ({ addBlock, triggerFileInput }) => {
  return (
    <div className={styles.controlsContainer}>
      <button
        className={styles.controlButton}
        onClick={() => addBlock("text")}
        aria-label="Add a new text block"
      >
        Add Text
      </button>

      <button
        className={styles.controlButton}
        onClick={triggerFileInput}
        aria-label="Add a new image block"
      >
        Add Image
      </button>

      <button
        className={styles.controlButton}
        onClick={() => addBlock("chart", { chartType: "line" })}
        aria-label="Add a new line chart block"
      >
        Add Line Chart
      </button>
      <button
        className={styles.controlButton}
        onClick={() => addBlock("chart", { chartType: "bar" })}
        aria-label="Add a new bar chart block"
      >
        Add Bar Chart
      </button>
      <button
        className={styles.controlButton}
        onClick={() => addBlock("chart", { chartType: "sparkline" })}
        aria-label="Add a new sparkline chart block"
      >
        Add Sparkline
      </button>
      <button
        className={styles.controlButton}
        onClick={() => addBlock("chart", { chartType: "spiral" })}
        aria-label="Add a new spiral chart block"
      >
        Add Spiral Chart
      </button>
    </div>
  );
};

Controls.propTypes = {
  addBlock: PropTypes.func.isRequired,
  triggerFileInput: PropTypes.func.isRequired,
};

export default Controls;
