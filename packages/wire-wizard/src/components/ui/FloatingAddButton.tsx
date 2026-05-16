import React, { useState } from 'react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: '#00ffa0',
        color: '#000',
        border: 'none',
        fontSize: '32px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 6px 20px rgba(0, 255, 160, 0.6)' : '0 4px 12px rgba(0, 255, 160, 0.4)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Add Block"
    >
      +
    </button>
  );
};
