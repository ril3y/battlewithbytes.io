import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { useLocalStorage } from './useLocalStorage';
import type { CalculatorState } from '@/types/tools';
import type { ToolResult } from '@/types';

interface UseCalculatorOptions {
  name: string;
  calculate: (inputs: Record<string, string>) => ToolResult[];
  validate?: (inputs: Record<string, string>) => Record<string, string>;
  initialInputs?: Record<string, string>;
  autoSave?: boolean;
}

interface UseCalculatorReturn {
  inputs: Record<string, string>;
  outputs: ToolResult[];
  errors: Record<string, string>;
  isValid: boolean;
  isCalculating: boolean;
  setInput: (name: string, value: string) => void;
  clearInputs: () => void;
  saveState: () => void;
  loadState: () => void;
}

/**
 * Custom hook for calculator state management
 */
export function useCalculator({
  name,
  calculate,
  validate,
  initialInputs = {},
  autoSave = true,
}: UseCalculatorOptions): UseCalculatorReturn {
  const storageKey = `calculator-${name}`;
  
  const [storedState, setStoredState] = useLocalStorage<CalculatorState>(storageKey, {
    inputs: initialInputs,
    outputs: {},
    errors: {},
    isValid: false,
  });

  const [inputs, setInputs] = useState<Record<string, string>>(
    autoSave ? storedState.inputs : initialInputs
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounce inputs to avoid excessive calculations
  const debouncedInputs = useDebounce(inputs, 300);

  // Calculate outputs based on inputs
  const outputs = useMemo(() => {
    if (!debouncedInputs || Object.keys(debouncedInputs).length === 0) {
      return [];
    }

    setIsCalculating(true);
    
    try {
      // Validate inputs
      if (validate) {
        const validationErrors = validate(debouncedInputs);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setIsCalculating(false);
          return [];
        }
      }

      // Clear errors if validation passes
      setErrors({});

      // Calculate results
      const results = calculate(debouncedInputs);
      setIsCalculating(false);
      
      // Auto-save if enabled
      if (autoSave) {
        setStoredState({
          inputs: debouncedInputs,
          outputs: results.reduce((acc, result, index) => {
            acc[index] = typeof result.value === 'number' ? result.value : 0;
            return acc;
          }, {} as Record<string, number>),
          errors: {},
          isValid: true,
        });
      }

      return results;
    } catch (error) {
      setErrors({ calculation: error instanceof Error ? error.message : 'Calculation error' });
      setIsCalculating(false);
      return [];
    }
  }, [debouncedInputs, calculate, validate, autoSave, setStoredState]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && outputs.length > 0;
  }, [errors, outputs]);

  const setInput = useCallback((name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const clearInputs = useCallback(() => {
    setInputs(initialInputs);
    setErrors({});
  }, [initialInputs]);

  const saveState = useCallback(() => {
    setStoredState({
      inputs,
      outputs: outputs.reduce((acc, result, index) => {
        acc[index] = typeof result.value === 'number' ? result.value : 0;
        return acc;
      }, {} as Record<string, number>),
      errors,
      isValid,
    });
  }, [inputs, outputs, errors, isValid, setStoredState]);

  const loadState = useCallback(() => {
    setInputs(storedState.inputs);
    setErrors(storedState.errors);
  }, [storedState]);

  return {
    inputs,
    outputs,
    errors,
    isValid,
    isCalculating,
    setInput,
    clearInputs,
    saveState,
    loadState,
  };
}