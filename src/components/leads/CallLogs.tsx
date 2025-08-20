// components/CallLogs.tsx
import React from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

interface CallLog {
  duration: string;
  calledOn: string;
  calledBy: string;
}

interface Props {
  callLogs: CallLog[];
}

const CallLogs: React.FC<Props> = ({ callLogs }) => {
  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <select className="border border-gray-300 px-4 py-2 rounded">
          <option>Select User...</option>
          <option>Admin</option>
        </select>
        <div className="flex items-center gap-2">
          <input type="date" className="border border-gray-300 px-2 py-2 rounded" />
          <span className="text-gray-500">→</span>
          <input type="date" className="border border-gray-300 px-2 py-2 rounded" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Call Duration</th>
              <th className="px-4 py-2 text-left">Called On</th>
              <th className="px-4 py-2 text-left">Called By</th>
            </tr>
          </thead>
          <tbody>
            {callLogs.map((log, index) => (
              <tr key={index} className="border-t border-gray-300">
                <td className="px-4 py-3">{log.duration}</td>
                <td className="px-4 py-3">{log.calledOn}</td>
                <td className="px-4 py-3">{log.calledBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-4 mt-4">
        <div className="flex items-center gap-1">
          <BiChevronLeft size={20} className="text-gray-500" />
          <button className="px-3 py-1 border rounded text-blue-500 border-blue-500">1</button>
          <BiChevronRight size={20} className="text-gray-500" />
        </div>
        <div>
          <select className="border border-gray-300 px-3 py-1 rounded">
            <option>10 / page</option>
            <option>25 / page</option>
            <option>50 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CallLogs;
