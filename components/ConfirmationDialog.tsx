import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Confirm Submission</h3>
        <p className="text-slate-600 mb-8">Are you sure you want to submit?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-md bg-gray-200 text-slate-800 font-semibold hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
