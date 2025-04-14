import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./Controls.module.css";

import {
  FaPlus,
  FaFont,
  FaImage,
  FaChartLine,
  FaChartBar,
  FaBolt,
  FaChartPie,
} from "react-icons/fa";
const Controls = ({ addBlock, triggerFileInput }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleAddClick = (type, options = {}) => {
    addBlock(type, options);
    setIsMenuOpen(false);
  };

  const handleAddImageClick = () => {
    triggerFileInput();
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.controlsContainer}>
      <button
        ref={buttonRef}
        className={`${styles.controlButton} ${styles.addBlockButton}`}
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
        aria-label="Add Block"
        title="Add Block"
      >
        <FaPlus />{" "}
      </button>

      {isMenuOpen && (
        <div ref={menuRef} className={styles.optionsMenu} role="menu">
          <button
            className={styles.optionButton}
            onClick={() => handleAddClick("text")}
            role="menuitem"
          >
            <FaFont className={styles.optionIcon} /> <span>Add Text</span>{" "}
          </button>
          <button
            className={styles.optionButton}
            onClick={handleAddImageClick}
            role="menuitem"
          >
            <FaImage className={styles.optionIcon} />
            <span>Add Image</span>
          </button>
          <button
            className={styles.optionButton}
            onClick={() => handleAddClick("chart", { chartType: "line" })}
            role="menuitem"
          >
            <FaChartLine className={styles.optionIcon} />
            <span>Add Line Chart</span>
          </button>
          <button
            className={styles.optionButton}
            onClick={() => handleAddClick("chart", { chartType: "bar" })}
            role="menuitem"
          >
            <FaChartBar className={styles.optionIcon} />
            <span>Add Bar Chart</span>
          </button>
          <button
            className={styles.optionButton}
            onClick={() => handleAddClick("chart", { chartType: "sparkline" })}
            role="menuitem"
          >
            <FaBolt className={styles.optionIcon} />
            <span>Add Sparkline</span>
          </button>
          <button
            className={styles.optionButton}
            onClick={() => handleAddClick("chart", { chartType: "spiral" })}
            role="menuitem"
          >
            <FaChartPie className={styles.optionIcon} />
            <span>Add Spiral Chart</span>
          </button>
        </div>
      )}
    </div>
  );
};

Controls.propTypes = {
  addBlock: PropTypes.func.isRequired,
  triggerFileInput: PropTypes.func.isRequired,
};

export default Controls;
