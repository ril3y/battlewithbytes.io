'use client';

import React, { useState, useCallback } from 'react';
import OhmsLawDiagram from './OhmsLawDiagram';
import OhmsLawForm from './OhmsLawForm';
import Description from './Description';
import { calculateOhmsLaw } from './ohmsLawUtils';
import './styles.css';

export interface OhmsLawValues {
  voltage: string;
  current: string;
  resistance: string;
  power: string;
}

export interface OhmsLawResults {
  voltage: string;
  current: string;
  resistance: string;
  power: string;
  calculatedProperty: 'voltage' | 'current' | 'resistance' | 'power' | null;
  description: string;
  displayCurrentInMilliamps?: boolean;
}

export default function OhmsLawCalculator() {
  const [values, setValues] = useState<OhmsLawValues>({
    voltage: '',
    current: '',
    resistance: '',
    power: ''
  });
  
  const [results, setResults] = useState<OhmsLawResults>({
    voltage: '',
    current: '',
    resistance: '',
    power: '',
    calculatedProperty: null,
    description: '',
    displayCurrentInMilliamps: undefined
  });

  const handleValueChange = useCallback((name: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCalculate = useCallback((calculationMode: 'voltage' | 'current' | 'resistance' | 'power') => {
    const result = calculateOhmsLaw(values, calculationMode);
    setResults(result);
  }, [values]);

  const handleClear = useCallback(() => {
    setValues({
      voltage: '',
      current: '',
      resistance: '',
      power: ''
    });
    
    setResults({
      voltage: '',
      current: '',
      resistance: '',
      power: '',
      calculatedProperty: null,
      description: '',
      displayCurrentInMilliamps: undefined
    });
  }, []);

  return (
    <div className="ohms-law-calculator">
      <div className="max-w-screen-xl mx-auto">
        <div className="ohms-law-container">
          <div className="ohms-law-left-section">
            <h2 className="text-xl font-bold mb-4">Ohm's Law Calculator</h2>
            <OhmsLawDiagram values={values} calculatedProperty={results.calculatedProperty} />
          </div>
          <div className="ohms-law-right-section">
            <OhmsLawForm 
              values={values}
              onValueChange={handleValueChange}
              onCalculate={handleCalculate}
              onClear={handleClear}
            />
          </div>
        </div>
        {results.calculatedProperty && (
          <Description results={results} />
        )}
      </div>
    </div>
  );
}
