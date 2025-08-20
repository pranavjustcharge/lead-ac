interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const Switch = ({ value, onChange }: SwitchProps) => {
  return (
    <div className="flex items-center gap-3">

      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 flex items-center rounded-full px-1 transition-colors duration-300 ${
          value ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            value ? "translate-x-5" : "translate-x-0"
          }`}
        ></div>
      </button>
    </div>
  );
};

export default Switch;
