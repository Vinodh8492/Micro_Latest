import React, { useEffect, useState } from "react";
import companyLogo from "../assets/Asm_Logo.png";
import chicken from "../assets/chicken.png";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import CurrentWeightGauge from "../components/CurrentWeightGauge";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useTopbar } from "./TopbarContext";

const Topbar = () => {
  const { reqWeight } = useTopbar();
  
  const { user, logout } = useAuth();
  const { themeColor } = useTheme();
  const [showLogout, setShowLogout] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [currentWeight, setCurrentWeight] = useState(0);
  const navigate = useNavigate();

  const toggleLogout = () => setShowLogout((prev) => !prev);

  const handleLogout = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/api/users/logout", null, {
        withCredentials: true,
      });

      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark-mode");
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWeight((prev) => (prev + 250) % 5000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const displayName =
    user?.username || user?.name || user?.email?.split("@")[0] || "Guest";

  const initial =
    (user?.username?.charAt(0) ||
      user?.name?.charAt(0) ||
      user?.email?.charAt(0) ||
      "A").toUpperCase();

  return (
    <div
      className={`w-full h-28 flex items-center justify-between px-6 shadow-md relative transition-all duration-300 ${theme === "dark"
        ? "bg-[#0f1c2f] text-[#e0f7ff] shadow-neon border-b border-cyan-400"
        : "bg-[#D4D6D9] text-gray-800"
        }`}
    >

      <div
        style={{
          height: "100%",
          width: "160px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CurrentWeightGauge
          weight={reqWeight}
          themeColor={themeColor}
          isDarkMode={theme === "dark"}
        />
      </div>



      {/* Right: Profile + logos */}
      <div className="flex items-center gap-6">
        <p className="text-md font-medium">
          Hello, <span className="font-bold">{displayName}</span>
        </p>

        {/* Profile Circle */}
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full bg-gray-600 text-white flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110"
            onClick={toggleLogout}
          >
            {initial}
          </div>

          {showLogout && (
            <div className="absolute top-14 right-0 flex flex-col items-end z-50">
              <div className="w-3 h-3 bg-white rotate-45 border-t border-l border-gray-200 relative -top-1 right-4"></div>
              <div className="bg-white border shadow-lg rounded-lg p-2 w-40 transform transition-all duration-300 origin-top-right scale-100 opacity-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 px-4 rounded-md text-red-600 font-medium hover:bg-red-50 hover:text-red-800 transition-all duration-150 w-full"
                >
                  <FaSignOutAlt className="text-xl" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logos */}
        <img
          src={companyLogo}
          alt="Company Logo"
          className="h-14 w-auto object-contain transition-all duration-200 hover:opacity-80"
        />
        <img
          src={chicken}
          alt="Chicken"
          className="h-30 w-30 object-contain transition-all duration-200 hover:opacity-80"
        />
      </div>
    </div>
  );
};

export default Topbar;