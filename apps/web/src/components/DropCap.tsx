import React from 'react';

/**
 * DropCap component for a hacker/cyber motif drop cap effect.
 * Wraps the first letter of its children in a styled div.
 * Usage: <DropCap>LoRa ...</DropCap>
 */
export default function DropCap({ children }: { children: React.ReactNode }) {
  return (
    <div className="dropcap-paragraph">{children}</div>
  );
}
