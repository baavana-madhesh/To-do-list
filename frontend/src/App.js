import React, {
  useState,
  useEffect,
  useCallback
} from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";

const API = process.env.REACT_APP_API;

function App() {
  const [view, setView] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authView, setAuthView] = useState("login");
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (validate token with backend)
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!savedToken || !savedUser) {
        setLoading(false);
        return;
      }

      try {
        // Validate token by requesting a protected endpoint
        await axios.get(`${API}/tasks`, {
          headers: {
            Authorization: `Bearer ${savedToken}`
          },
        });

        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (err) {
        console.warn("Token validation failed:", err?.response?.status || err.message);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthView("login");
    setView("dashboard");
  }, [setToken, setUser, setIsAuthenticated, setAuthView, setView]);

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  }, [token, handleLogout]);

  // Fetch tasks on mount or when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, fetchTasks]);

  // Handle successful login
  const handleLoginSuccess = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle successful registration
  const handleRegisterSuccess = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);
  };


  // Show loading state
  if (loading) {
    return (
      <div style={{
        textAlign: "center",
        padding: "50px",
      }}>
        Loading...
      </div>
    );
  }

  // Show login/register pages if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        {authView === "login" ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} setAuthView={setAuthView} />
        ) : (
          <RegisterPage onRegisterSuccess={handleRegisterSuccess} setAuthView={setAuthView} />
        )}
      </>
    );
  }

  // Show main app if authenticated
  return (
    <div style={{ display: "flex" }}>
      <Sidebar setView={setView} tasks={tasks} user={user} onLogout={handleLogout} />
      <MainContent view={view} tasks={tasks} fetchTasks={fetchTasks} token={token} user={user} />
    </div>
  );
}

export default App;