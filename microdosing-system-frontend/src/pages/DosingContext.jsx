// DosingContext.js
import React, { createContext, useContext, useState } from 'react';

const DosingContext = createContext();

export const DosingProvider = ({ children }) => {
  const [dosingRecords, setDosingRecords] = useState([]);

  const addDosingRecord = (record) => {
    setDosingRecords((prev) => [...prev, record]);
  };

  return (
    <DosingContext.Provider value={{ dosingRecords, addDosingRecord }}>
      {children}
    </DosingContext.Provider>
  );
};

export const useDosing = () => useContext(DosingContext);
