import React, { ReactNode } from 'react';
import { DisplayProvider } from './DisplayContext';
import { SelectionProvider } from './SelectionContext';
import { DiagramProvider } from './DiagramContext';
import { InteractionProvider } from './InteractionContext';
import type { DiagramData } from '../types';

/**
 * WireWizardProvider — combined provider for all Wire Wizard contexts.
 *
 * Wraps the application with:
 *   - DiagramProvider     (blocks, wires, busGroups + autosave)
 *   - SelectionProvider   (selection state)
 *   - DisplayProvider     (display settings)
 *   - InteractionProvider (transient UI interaction state)
 *
 * `storageKey` controls localStorage autosave / autoload. Pass `null` to
 * disable both (used by the read-only viewer and the iframe embed route).
 */
interface WireWizardProviderProps {
  children: ReactNode;
  initialData?: Partial<DiagramData>;
  storageKey?: string | null;
}

export function WireWizardProvider({ children, initialData, storageKey }: WireWizardProviderProps) {
  return (
    <DiagramProvider initialData={initialData} storageKey={storageKey}>
      <SelectionProvider>
        <DisplayProvider>
          <InteractionProvider>
            {children}
          </InteractionProvider>
        </DisplayProvider>
      </SelectionProvider>
    </DiagramProvider>
  );
}
