import React, { createContext, useState } from "react";

interface Lead {
  referenceNumber: string;
  name: string;
  email: string;
  id: string;
}

interface AppContextType {
  mode: string;
  toggleMode: () => void;
  leadId: string | null;
  setLeadId: (id: string | null) => void;
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
}

export const AppContext = createContext<AppContextType>({
  mode: "light",
  toggleMode: () => {},
  leadId: null,
  setLeadId: () => {},
  leads: [],
  setLeads: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState("light");
  const [leadId, setLeadId] = useState<string | null>(null);
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
