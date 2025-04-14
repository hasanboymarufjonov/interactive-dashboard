import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import styles from "./AuthForm.module.css";
const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      return setError("Please fill in all fields.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);
      await signup(email, password, fullName);
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup Error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (err.code === "auth/weak-password") {
        setError("Enter at least 6 characters");
      } else {
        setError("Unknown error");
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPageContainer}>
      <h1 className={styles.appNameHeader}>Interactive Dashboard</h1>
      <div className={styles.authContainer}>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <h2>Sign Up</h2>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formGroup}>
            <label htmlFor="full-name">Full Name</label>
            <input
              type="text"
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Enter your full name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Create a password (min. 6 characters)"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          <div className={styles.switchAuth}>
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
