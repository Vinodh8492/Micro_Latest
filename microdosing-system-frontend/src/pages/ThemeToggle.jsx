import React, { useEffect, useState } from "react";
import { BsSun, BsMoon } from "react-icons/bs";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
  
    if (theme === "dark") {
      root.classList.add("dark-mode");
      root.classList.remove("light-mode");
      body.classList.add("dark-mode");
      body.classList.remove("light-mode");
    } else {
      root.classList.add("light-mode");
      root.classList.remove("dark-mode");
      body.classList.add("light-mode");
      body.classList.remove("dark-mode");
    }
  
    localStorage.setItem("theme", theme);
  }, [theme]);
  

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-1.5 rounded-full shadow transition-all duration-300 flex items-center justify-center w-9 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 dark:bg-gray-800"
      aria-label="Toggle Theme"
    >
      {theme === "light" ? (
        <BsMoon size={18} className="text-gray-700 dark:text-gray-200 transition-transform duration-300 transform hover:rotate-180" />
      ) : (
        <BsSun size={18} className="text-yellow-400 transition-transform duration-300 transform hover:rotate-180" />
      )}
    </button>
  );
};

export default ThemeToggle;
