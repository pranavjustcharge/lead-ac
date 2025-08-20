import { FaExclamationCircle } from "react-icons/fa";


type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-[400px] p-6">
        {/* Icon and Title */}
        <div className="flex items-center gap-2 mb-2">
          <FaExclamationCircle className="text-yellow-500 text-xl" />
          <h2 className="text-lg font-semibold">Are you sure?</h2>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:border-blue-500 hover:text-blue-500 cursor-pointer"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1 border border-red-500 text-red-500 cursor-pointer rounded-md hover:opacity-50"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
