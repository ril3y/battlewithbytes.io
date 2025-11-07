// src/components/HDMIPinout.jsx

import React, { useState } from 'react';
import styles from './HDMIPinout.module.css';

const pinData = {
  1: { name: 'TMDS Data2+', description: 'Transition Minimized Differential Signaling for video data', category: 'video' },
  2: { name: 'TMDS Data2 Shield', description: 'Ground shield for Data2', category: 'ground' },
  3: { name: 'TMDS Data2−', description: 'Negative TMDS Data2', category: 'video' },
  4: { name: 'TMDS Data1+', description: 'Positive TMDS Data1', category: 'video' },
  5: { name: 'TMDS Data1 Shield', description: 'Ground shield for Data1', category: 'ground' },
  6: { name: 'TMDS Data1−', description: 'Negative TMDS Data1', category: 'video' },
  7: { name: 'TMDS Data0+', description: 'Positive TMDS Data0', category: 'video' },
  8: { name: 'TMDS Data0 Shield', description: 'Ground shield for Data0', category: 'ground' },
  9: { name: 'TMDS Data0−', description: 'Negative TMDS Data0', category: 'video' },
  10: { name: 'TMDS Clock+', description: 'Positive TMDS Clock', category: 'clock' },
  11: { name: 'TMDS Clock Shield', description: 'Ground shield for Clock', category: 'ground' },
  12: { name: 'TMDS Clock−', description: 'Negative TMDS Clock', category: 'clock' },
  13: { name: 'CEC', description: 'Consumer Electronics Control - allows devices to control each other', category: 'control' },
  14: { name: 'Reserved', description: 'Not connected, reserved for future use', category: 'reserved' },
  15: { name: 'SCL (DDC)', description: 'I2C Clock line for DDC - what we use for hacking', category: 'i2c', highlight: true },
  16: { name: 'SDA (DDC)', description: 'I2C Data line for DDC - what we use for hacking', category: 'i2c', highlight: true },
  17: { name: 'DDC/CEC Ground', description: 'Ground reference for DDC and CEC', category: 'ground' },
  18: { name: '+5V Power', description: '5 volt power (50mA max)', category: 'power' },
  19: { name: 'Hot Plug Detect', description: 'Indicates when a display is connected', category: 'control' }
};

const categoryColors = {
  video: '#0088ff',
  ground: '#666666',
  clock: '#ffa500',
  control: '#c084fc',
  reserved: '#444444',
  i2c: '#00ff9d',
  power: '#ff3333'
};

const HDMIPinout = () => {
  const [activePin, setActivePin] = useState(15); // Default to SCL pin
  const [viewMode, setViewMode] = useState('pinout'); // 'pinout' or 'table'
  
  return (
    <div className={styles.hdmiContainer}>
      <div className={styles.viewToggle}>
        <button 
          className={viewMode === 'pinout' ? styles.activeView : ''} 
          onClick={() => setViewMode('pinout')}
        >
          Connector View
        </button>
        <button 
          className={viewMode === 'table' ? styles.activeView : ''} 
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
      </div>
      
      {viewMode === 'pinout' ? (
        <div className={styles.pinoutView}>
          <div className={styles.connectorShape}>
            {/* Connector graphical representation */}
            <div className={styles.pinContainer}>
              {Object.entries(pinData).map(([pinNumber, data]) => (
                <div 
                  key={pinNumber}
                  className={`${styles.pin} ${activePin === parseInt(pinNumber) ? styles.activePin : ''} ${data.highlight ? styles.highlightPin : ''}`}
                  style={{ 
                    backgroundColor: data.highlight ? categoryColors[data.category] : undefined,
                    borderColor: categoryColors[data.category]
                  }}
                  onMouseEnter={() => setActivePin(parseInt(pinNumber))}
                  onFocus={() => setActivePin(parseInt(pinNumber))}
                  onClick={() => setActivePin(parseInt(pinNumber))}
                  tabIndex={0}
                  data-pin={pinNumber}
                ></div>
              ))}
            </div>
          </div>
          
          <div className={styles.pinDetails}>
            <h3>
              Pin {activePin}: <span style={{ color: categoryColors[pinData[activePin].category] }}>{pinData[activePin].name}</span>
            </h3>
            <p>{pinData[activePin].description}</p>
            {pinData[activePin].highlight && (
              <div className={styles.hackingNote}>
                <h4>Hacking Potential</h4>
                <p>This I2C pin can be accessed to interact with the display&apos;s EDID and control functions, allowing us to programmatically control HDMI devices.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.tableView}>
          <table>
            <thead>
              <tr>
                <th>Pin</th>
                <th>Name</th>
                <th>Function</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(pinData).map(([pinNumber, data]) => (
                <tr 
                  key={pinNumber} 
                  className={data.highlight ? styles.highlightRow : ''}
                  onClick={() => setActivePin(parseInt(pinNumber))}
                >
                  <td>{pinNumber}</td>
                  <td style={{ color: categoryColors[data.category] }}>{data.name}</td>
                  <td>{data.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className={styles.legend}>
        <h4>Pin Categories</h4>
        <ul>
          {Object.entries(categoryColors).map(([category, color]) => (
            <li key={category}>
              <span className={styles.colorBox} style={{ backgroundColor: color }}></span>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HDMIPinout;