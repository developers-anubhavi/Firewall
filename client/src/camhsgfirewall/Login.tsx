import '../camhsgfirewall/login.css';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import logo from '../assets/TieiLogo.png';
import Settings from '../camhsgfirewall/Settings';

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [userError, setUserError] = useState(false);
  const [passError, setPassError] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);

  const [userType, setUserType] = useState("");

  const showToast = (msg: string) => {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = msg;
    toast.style.display = "block";

    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  };

  const logoutUser = useCallback(() => {
    if (username) {
      fetch("http://192.168.0.20:4001/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
    }

    localStorage.removeItem("authUser");
    localStorage.removeItem("authUserType");

    setLoggedIn(false);
    window.location.href = "/";
  }, [username]);

  useEffect(() => {
    function loadUserFromStorage() {
      const saved = localStorage.getItem("authUser");
      const savedType = localStorage.getItem("authUserType");

      if (saved) {
        setUsername(saved);
        setUserType(savedType || "");
        setLoggedIn(true);
      }
    }
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      if (username) {
        const payload = JSON.stringify({ username });

        const blob = new Blob([payload], { type: "text/plain" });

        navigator.sendBeacon("http://192.168.0.20:4001/auth/logout", blob);
      }

      localStorage.removeItem("authUser");
      localStorage.removeItem("authUserType");
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [username]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => logoutUser(), 15 * 60 * 1000);
    };

    if (loggedIn) {
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      resetTimer();
    }

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      clearTimeout(timeout);
    };
  }, [loggedIn, logoutUser]);

  const handleLogin = async () => {
    setUserError(false);
    setPassError(false);

    if (!username) setUserError(true);
    if (!password) setPassError(true);
    if (!username || !password) return;

    try {
      const response = await fetch("http://192.168.0.20:4001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.field === "status") {                                                                              
        showToast("USER ALREADY LOGGED IN ON ANOTHER DEVICE");
        return;
      }

      if (!response.ok) {
        if (data.field === "username") setUserError(true);
        if (data.field === "password") setPassError(true);
        return;
      }

      localStorage.setItem("authUser", username);
      localStorage.setItem("authUserType", data.usertype);

      setUserType(data.usertype);
      setLoggedIn(true);

    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  if (loggedIn) {
    return (
      <Settings
        username={username}
        logout={logoutUser}
        usertype={userType}
      />
    );
  }

  return (
    <div className="login-container">
      
      <div id="toast" className="toast"></div>

      <div className="login-box">

        <div className="logo-container">
          <img src={logo} alt="logo" className="login-logo" />
        </div>

        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={userError ? "error-input" : ""}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passError ? "error-input" : ""}
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </span>
          </div>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

      </div>
    </div>
  );
}
