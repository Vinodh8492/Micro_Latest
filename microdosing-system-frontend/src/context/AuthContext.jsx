// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("❌ Error parsing stored user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
      }
    }
  }, []);

  const login = (userInfo, token) => {
    console.log("📥 Login received:", userInfo); // 👀 log userInfo for debugging

    if (typeof token === "string") {
      localStorage.setItem("access_token", token);
    } else {
      console.warn("⚠️ Invalid token received:", token);
    }

    if (userInfo) {
      localStorage.setItem("user", JSON.stringify(userInfo));
      setUser(userInfo);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
