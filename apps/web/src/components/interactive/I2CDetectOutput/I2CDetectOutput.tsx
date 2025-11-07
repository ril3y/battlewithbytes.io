"use client";

import React, { useState } from 'react';
import styles from './I2CDetectOutput.module.css';

interface TooltipData {
  address: string;
  color: string;
  content: string;
}

interface I2CDetectOutputProps {
  highlights?: TooltipData[];
}

// This component is specifically designed to render i2cdetect output
// with proper formatting and tooltips for specific addresses
const I2CDetectOutput: React.FC<I2CDetectOutputProps> = ({ 
  highlights = []
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  const handleMouseOver = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.currentTarget;
    const address = target.getAttribute('data-address');
    const highlight = highlights.find(h => h.address === address);
    
    if (highlight) {
      const rect = target.getBoundingClientRect();
      const containerRect = document.getElementById('i2c-output-container')?.getBoundingClientRect();
      
      if (containerRect) {
        // Move tooltip higher so it's one line above the number
        // Using a larger value (100px) to ensure it's moved up by roughly one line
        setTooltipPosition({
          top: rect.top - containerRect.top - 100,
          left: rect.left - containerRect.left + (rect.width / 2)
        });
        
        setActiveTooltip(highlight.content);
      }
    }
  };
  
  // Helper to render a highlighted address
  const renderAddress = (address: string) => {
    const highlight = highlights.find(h => h.address === address);
    
    if (highlight) {
      return (
        <span 
          className={styles.highlight}
          style={{ color: highlight.color }}
          data-address={address}
          onMouseEnter={handleMouseOver}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          {address}
        </span>
      );
    }
    
    return address;
  };

  return (
    <div id="i2c-output-container" className={styles.container}>
      <pre className={styles.output}>
<span className={styles.command}>$ sudo i2cdetect -y 2</span>
<span className={styles.header}>     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f</span>
<span className={styles.row}>00:                         -- -- -- -- -- -- -- --</span>
<span className={styles.row}>10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --</span>
<span className={styles.row}>20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --</span>
<span className={styles.row}>30: -- -- -- -- -- -- -- {renderAddress("37")} -- -- 3a -- -- -- -- --</span>
<span className={styles.row}>40: -- -- -- -- -- -- -- -- -- -- 4a 4b -- -- -- --</span>
<span className={styles.row}>50: {renderAddress("50")} -- -- -- 54 -- -- -- -- -- -- -- -- -- -- --</span>
<span className={styles.row}>60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --</span>
<span className={styles.row}>70: -- -- -- -- -- -- -- --</span>
      </pre>
      
      {activeTooltip && (
        <div 
          className={styles.tooltip}
          style={{ 
            top: `${tooltipPosition.top}px`, 
            left: `${tooltipPosition.left}px` 
          }}
        >
          {activeTooltip}
          <div className={styles.tooltipArrow}></div>
        </div>
      )}
    </div>
  );
};

export default I2CDetectOutput;
