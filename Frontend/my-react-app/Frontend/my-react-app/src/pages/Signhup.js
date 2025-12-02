
import React, { useState } from "react";
import axios from "axios";
import "../styles/auth.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null); // store logged-in user

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/signup", {
        username,
        email,
        password,
      });

      if (res.data.success) {
        setUser(username || email); // show username/email in main page
        setMessage("Signup successful!");
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
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
              placeholder="Enter Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign Up</button>
          </form>
          {message && <p className="msg">{message}</p>}
        </>
      ) : (
        <>
          <h2>Welcome, {user}!</h2>
          <p>You are logged in to your AI Resume Scanner account.</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}

export default Signup;
