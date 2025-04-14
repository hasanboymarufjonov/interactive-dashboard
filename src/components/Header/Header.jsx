import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate();
  const popoverRef = useRef(null);
  const iconRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      setIsPopoverOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  useEffect(() => {}, [isPopoverOpen]);

  const userInitial = currentUser?.displayName
    ? currentUser.displayName[0].toUpperCase()
    : currentUser?.email
    ? currentUser.email[0].toUpperCase()
    : "?";

  return (
    <header className={styles.header}>
      <h1>Interactive Dashboard</h1>

      <div className={styles.controlsContainer}>
        {currentUser && (
          <div className={styles.profileContainer}>
            <div
              ref={iconRef}
              className={styles.profileIcon}
              onClick={togglePopover}
              title="Profile & Logout"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") togglePopover();
              }}
              role="button"
              aria-haspopup="true"
              aria-expanded={isPopoverOpen}
            >
              {userInitial}
            </div>

            {isPopoverOpen && (
              <div ref={popoverRef} className={styles.popover} role="menu">
                <p>Logged in as:</p>
                {currentUser.displayName && (
                  <p>
                    <strong>{currentUser.displayName}</strong>
                  </p>
                )}
                <p>{currentUser.email}</p>
                <hr
                  style={{
                    width: "100%",
                    border: "none",
                    borderTop: "1px solid #eee",
                  }}
                />
                <button onClick={handleLogout} role="menuitem">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
