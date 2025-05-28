import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose} // Close modal on overlay click
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-gray-700"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
