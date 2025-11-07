"use client";

import React, { useState } from 'react';
import styles from './TooltipText.module.css';

export interface TooltipItem {
  text: string;       // The text to be highlighted
  tooltip: string;    // The tooltip content
  color?: string;     // Optional color for the highlighted text
}

interface TooltipTextProps {
  content: string;              // The full content string
  tooltips: TooltipItem[];      // Array of items to add tooltips to
  className?: string;           // Optional additional className
  position?: 'top' | 'bottom' | 'left' | 'right';  // Tooltip position
  mono?: boolean;               // Whether to use monospace font
}

const TooltipText: React.FC<TooltipTextProps> = ({
  content,
  tooltips,
  className,
  position = 'bottom',
  mono = true
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Process the content to replace tooltip targets with interactive spans
  const processContent = () => {
    let processedContent = content;
    
    tooltips.forEach((item) => {
      // Create a regex to match the exact text
      const regex = new RegExp(`(${item.text})`, 'g');
      
      // Replace with an interactive span
      processedContent = processedContent.replace(regex, `<span 
        class="${styles.tooltipTarget}" 
        style="color: ${item.color || '#00ff9d'}" 
        data-tooltip="${item.tooltip.replace(/"/g, '&quot;')}"
        data-text="${item.text.replace(/"/g, '&quot;')}"
      >$1</span>`);
    });
    
    return processedContent;
  };

  // Handle mouseover event
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains(styles.tooltipTarget)) {
      const tooltip = target.getAttribute('data-tooltip');
      setActiveTooltip(tooltip);
    } else {
      setActiveTooltip(null);
    }
  };

  return (
    <div className={`${styles.tooltipContainer} ${className || ''} ${mono ? styles.mono : ''}`}>
      <div 
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: processContent() }}
        onMouseOver={handleMouseOver}
        onMouseOut={() => setActiveTooltip(null)}
      />
      
      {activeTooltip && (
        <div className={`${styles.tooltip} ${styles[position]}`}>
          {activeTooltip}
        </div>
      )}
    </div>
  );
};

export default TooltipText;
