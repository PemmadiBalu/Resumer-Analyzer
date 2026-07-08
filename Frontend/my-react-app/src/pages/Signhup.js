

import React, { useState } from "react";
import axios from "axios";
import "../styles/auth.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/signup",
        {
          username,
          email,
          password,
        }
      );

      if (res.data.success) {
        setUser(username);
        setMessage(res.data.message);

        // Clear form
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setMessage("");
  };

  return (
    <div className="auth-container">
      {!user ? (
        <>
          <h2>Sign Up</h2>

          <form className="auth-form" onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter Password (Minimum 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          {message && <p className="msg">{message}</p>}
        </>
      ) : (
        <>
          <h2>Welcome, {user}!</h2>
          <p>Your account has been created successfully.</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}

export default Signup;
