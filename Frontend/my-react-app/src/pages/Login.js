

import React, { useState } from "react";
import axios from "axios";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/login",
        {
          email,
          password,
        }
      );

      if (res.data.success) {
        setUser({
          username: res.data.username,
          email,
          lastLogin: new Date().toLocaleString(),
        });

        setMessage(res.data.message || "Login successful!");

        setEmail("");
        setPassword("");
      } else {
        setMessage(res.data.message || "Login failed");
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setEmail("");
    setPassword("");
    setMessage("");
  };

  return (
    <div className="auth-container">
      {!user ? (
        <>
          <h2>Login</h2>

          <form className="auth-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          {message && <p className="msg">{message}</p>}
        </>
      ) : (
        <>
          <h2>Welcome, {user.username}!</h2>

          <p>You are logged in to your AI Resume Analyzer.</p>

          <div className="account-details">
            <h3>Account Details</h3>

            <ul>
              <li>
                <strong>Username:</strong> {user.username}
              </li>

              <li>
                <strong>Email:</strong> {user.email}
              </li>

              <li>
                <strong>Last Login:</strong> {user.lastLogin}
              </li>
            </ul>
          </div>

          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}

export default Login;
