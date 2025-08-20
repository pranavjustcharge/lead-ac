import React, { createContext, useState } from "react";

interface Lead {
  referenceNumber: string;
  name: string;
  email: string;
  id: string;
}


export const AppContext = createContext<{ mode: string; toggleMode: () => void }>({
  mode: "light",
  toggleMode: () => { },
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState("light");
  const [leadId,setLeadId] = useState(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  console.log(leadId);
  const toggleMode = () => {
    setMode(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <AppContext.Provider value={{ mode, toggleMode, leadId, setLeadId, leads, setLeads }}>
      <div className={mode === "dark" ? "dark" : ""}>
        {children}
      </div>
    </AppContext.Provider>
  );
};
