import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaBox,
  FaClipboardList,
  FaShoppingCart,
  FaLayerGroup,
  FaUserShield,
  FaHistory,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import LogoDark from "../assets/Hercules1.png";
import LogoLight from "../assets/Hercules.png";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const { user } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains("dark-mode"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains("dark-mode"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  const navItems = [
    { path: "/", icon: FaTachometerAlt, label: "Dashboard" },
    { path: "/material", icon: FaBox, label: "Materials" },
    // { path: "/storage", icon: FaUserShield, label: "Storage" },
    { path: "/recipes", icon: FaClipboardList, label: "Formulas" },
    { path: "/activeorders", icon: FaShoppingCart, label: "Microdosing" },
    { path: "/batches", icon: FaLayerGroup, label: "Batches" },
    { path: "/history", icon: FaHistory, label: "History" },

  ];

  if (user?.role === "admin") {
    navItems.push({
      path: "/admin",
      icon: FaLayerGroup,
      label: "Administrator",
    });
  }

  if (user?.role === "admin") {
    navItems.push({
      path: "/settings",
      icon: FaLayerGroup,
      label: "Settings",
    });
  }
  


  if (!user) {
    navItems.push({
      path: "/login",
      icon: FaUserShield,
      label: "Login",
    });
  }

  return (
    <div className="relative flex h-screen">
      <aside
        className={`${
          isOpen ? "w-64" : "w-20"
        } h-full shadow-md transition-all duration-300 flex flex-col ${
          isDarkMode
            ? "bg-[#0f1c2f] text-white sidebar-glow"
            : "bg-[#D4D6D9] text-black border-r"
        }`}
      >
        <div className="p-4 flex justify-center items-center">
          <div
            className={`transition-all duration-300 flex items-center justify-center w-full ${
              isDarkMode ? "logo-glow" : ""
            }`}
            style={{
              padding: "1rem",
              borderRadius: "12px",
              background: isDarkMode ? "rgba(15,28,47,0.9)" : "transparent",
            }}
          >
            <img
              src={isDarkMode ? LogoLight : LogoDark}
              alt="Hercules Logo"
              className={`transition-all duration-300 ${
                isOpen ? "h-22" : "h-10"
              }`}
              style={{ width: "100%", objectFit: "contain" }}
            />
          </div>
        </div>

        <nav className="mt-6 space-y-2 px-4 text-sm flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 py-2 font-medium px-2 rounded-md transition ${
                activeLink === item.path
                  ? "bg-gray-700 text-white"
                  : isDarkMode
                  ? "text-white hover:bg-gray-800 hover:text-cyan-300"
                  : "hover:bg-gray-300 hover:text-black"
              }`}
              onClick={() => handleLinkClick(item.path)}
            >
              <item.icon />
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}