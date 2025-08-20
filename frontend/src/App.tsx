import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Sidebar from './components/layout/Sidebar';
import Navbar from "./components/layout/Navbar";
import PageHeader from "./components/layout/PageHeader";

import Leads from "./pages/Leads";
import CallManager from "./pages/CallManager";
import { ToastContainer } from "react-toastify";
import CreateLead from "./pages/CreateLead";
import Home from "./pages/Home";

const App: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const shouldHideLayout = /^\/call-manager\/[^/]+$/.test(location.pathname);

  return (
    <div className="flex">
      {!shouldHideLayout && <Sidebar expanded={expanded} />}
      <ToastContainer />
      <div
        className={`flex-1 bg-gray-50 min-h-screen transition-all duration-300 ${!shouldHideLayout ? (expanded ? "ml-[250px]" : "ml-[80px]") : "ml-0"
          }`}
      >
        {!shouldHideLayout && <Navbar onToggle={() => setExpanded(prev => !prev)} />}

        <Routes>
          <Route
            path="/"
            element={
              <>
                <PageHeader title="Dashboard" breadcrumb="" />
                <Home />
              </>
            }
          />
          <Route
            path="/leads"
            element={
              <>
                <PageHeader
                  title="Leads"
                  breadcrumb="Dashboard - Leads & Calls - Leads"
                />
                <Leads />
              </>
            }
          />

          <Route
            path="/leads/create"
            element={
              <>
                <PageHeader
                  title="Create New Leads"
                  breadcrumb="Dashboard - Leads - Create"
                />
                <CreateLead/>
              </>
            }
          />

          <Route path="/call-manager/:reference" element={<CallManager />} />
        </Routes>
      </div>

    </div>
  );
};

export default App;
