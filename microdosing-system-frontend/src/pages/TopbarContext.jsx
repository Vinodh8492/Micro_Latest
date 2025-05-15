
import React, { createContext, useContext, useState } from "react";

const TopbarContext = createContext();

export const useTopbar = () => useContext(TopbarContext);

export const TopbarProvider = ({ children }) => {
  const [reqWeight, setReqWeight] = useState(null);

  return (
    <TopbarContext.Provider value={{ reqWeight, setReqWeight }}>
      {children}
    </TopbarContext.Provider>
  );
};
