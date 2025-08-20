import React, { useState } from "react";
import Switch from "../ui/Switch";

const PageHeader = ({ title, breadcrumb }) => {
  const [started, setStarted] = useState(true);
  return (
    <div className="px-6 mt-4 flex justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-4">{breadcrumb}</p>
      </div>
      <div className="flex gap-2 items-center">
        <h1>View All Campaigns</h1>
        <Switch
          value={started}
          onChange={setStarted}
        />
      </div>
    </div>
  );
};

export default PageHeader;
