import React, { useState } from "react";
import axios from "axios";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://resumer-analyzer.onrender.com/login",
        {
          email, // backend expects `email`
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setUser({
          name: res.data.username || email,
          email: res.data.email || email,
          lastLogin: new Date().toLocaleString(),
        });
        setMessage("Login successful!");
      } else {
        setMessage(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Login failed");
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
            <button type="submit">Log in</button>
          </form>
          {message && <p className="msg">{message}</p>}
        </>
      ) : (
        <>
          <h2>Welcome, {user.name}!</h2>
          <p>You are logged in to your AI Resume Scanner account.</p>

          <div className="account-details">
            <h3>Account Details</h3>
            <ul>
              <li><strong>Username:</strong> {user.name}</li>
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Last Login:</strong> {user.lastLogin}</li>
            </ul>
          </div>

          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}

export default Login;
