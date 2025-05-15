// components/NeonCard.jsx
import React from "react";

export default function NeonCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl p-4 transition-all duration-300 ${className}`}
      style={{
        background: 'linear-gradient(145deg, #0f1c2f 0%, #081b29 50%, #0a2a4f 100%)',
        color: '#e0f7ff',
        boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 255, 255, 0.2)',
      }}
    >
      {children}
    </div>
  );
}
