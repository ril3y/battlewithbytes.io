import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { produce } from 'immer'; // Use named import
import { 
  Connector, 
  Pin, 
  Mapping, 
  Wire, // Import Wire type
  WireMapperProject, 
  PinIdentifier, 
  AppMode, 
  WireMapperSettings 
} from '../types';

// Helper function to generate random colors (brighter)
const getRandomHexColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  const highComp = Math.floor(Math.random() * 3); 
  for (let i = 0; i < 6; i++) {
    let char;
    if (Math.floor(i / 2) === highComp) {
      char = letters[Math.floor(Math.random() * 8) + 8];
    } else {
      char = letters[Math.floor(Math.random() * 16)];
    }
    color += char;
  }
   const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 80) { 
    return getRandomHexColor();
  }
  return color;
};

// Helper to create a Wire object from a Mapping and its Pins
const _createWireFromMapping = (mapping: Mapping, sourcePin: Pin, targetPin: Pin): Wire | null => {
  // Basic validation
  if (!sourcePin || !targetPin) {
    console.error("Cannot create wire: missing source or target pin.");
    return null;
  }
  
  // Construct the wire object
  const wire: Wire = {
    id: mapping.wireId,
    source: {
      connectorId: mapping.source.connectorId,
      pinPos: sourcePin.pos, // Use pos for consistency
    },
    target: {
      connectorId: mapping.target.connectorId,
      pinPos: targetPin.pos, // Use pos for consistency
    },
    color: mapping.color || '#888888', // Use mapping color or default
    thickness: 1, // Default thickness, removed mapping.thickness
    label: mapping.netName || '', // Use netName from mapping as label
    // Add other wire properties as needed
  };
  
  return wire;
};

interface WireMapperState {
  projectName: string;
  connectors: Connector[];
  mappings: Mapping[];
  wires: Wire[]; // Add wires array to the state
  selectedPin: PinIdentifier | null;
  selectedConnectorId: string | null;
  settings: WireMapperSettings;
  
  // Project actions
  setProjectName: (name: string) => void;
  loadProject: (project: WireMapperProject) => void;
  saveProject: () => WireMapperProject;
  clearProject: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<WireMapperSettings>) => void;
  setMode: (mode: AppMode) => void;

  // Connector actions
  addConnector: (connectorData: Omit<Connector, 'id'>) => string;
  updateConnector: (id: string, updates: Partial<Connector>) => void;
  removeConnector: (id: string) => void;
  setSelectedConnector: (connectorId: string | null) => void;
  updateConnectorPosition: (id: string, x: number, y: number) => void;
  rotateConnector: (id: string, rotation: number) => void;
  
  // Pin actions
  updatePin: (connectorId: string, pinPos: number, updates: Partial<Pin>) => void;
  updatePinDetailsAndNet: (connectorId: string, pinPos: number, updates: Partial<Pin>, netName?: string) => void;
  setSelectedPin: (connectorId: string | null, pinPos: number | null) => void;
  clearPinSelection: () => void;
  isPinConnected: (pinPos: number, connectorId: string) => boolean;
  setSelectedConnectorId: (id: string | null) => void;
  
  // Mapping actions
  addMapping: (newMapping: Omit<Mapping, 'id' | 'wireId'>) => void;
  updateMapping: (id: string, updates: Partial<Omit<Mapping, 'id' | 'wireId'>>) => void;
  removeMapping: (id: string) => void;
}

export const useWireMapperStore = create<WireMapperState>((set, get) => ({
  projectName: 'New Harness',
  connectors: [],
  mappings: [],
  wires: [], // Initialize wires array
  selectedPin: null,
  selectedConnectorId: null,
  settings: {
    mode: 'normal',
    centerEmptyRows: true,
    namePosition: 'above',
    simplifyConnections: true,
    snapToGrid: true,
    showGrid: true,
    gridSize: 20,
    connectionMode: 'normal',
    darkMode: true,
  },
  
  // Project actions
  setProjectName: (name: string) => set({ projectName: name }),
  
  loadProject: (project) => set({
    projectName: project.projectName,
    connectors: project.connectors,
    mappings: project.mappings,
    selectedPin: null
  }),
  
  saveProject: () => {
    const { projectName, connectors, mappings } = get();
    return { projectName, connectors, mappings };
  },
  
  // Settings actions
  updateSettings: (settings: Partial<WireMapperSettings>) => set(state => ({
    settings: { ...state.settings, ...settings }
  })),
  
  setMode: (mode: AppMode) => set(state => ({
    settings: { ...state.settings, mode }
  })),
  
  clearProject: () => {
    // Clear localStorage - use the correct keys
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wireMapperProject');
      localStorage.removeItem('wireMapperSettings');
    }
    
    // Reset state
    set({
      projectName: 'New Harness',
      connectors: [],
      mappings: [],
      selectedPin: null
    });
  },
  
  // Connector actions
  addConnector: (connectorData: Omit<Connector, 'id'>) => {
    const id = nanoid();
    set((state: WireMapperState) => {
      // Calculate actual rows and columns based on pinPattern or provided values
      let actualRows = connectorData.rows ?? 1;
      let actualCols = connectorData.cols ?? 1;
      const pinPattern = connectorData.config?.pinPattern?.trim();

      if (pinPattern) {
        try {
          const patternParts = pinPattern.split(',').map((p: string) => parseInt(p.trim(), 10));
          if (patternParts.length > 0 && patternParts.every((p: number) => !isNaN(p) && p > 0)) {
            actualRows = patternParts.length;
            actualCols = Math.max(...patternParts);
            console.log(`[Store] Using pinPattern: ${pinPattern}. Calculated rows=${actualRows}, cols=${actualCols}`);
          } else {
            console.warn(`[Store] Invalid pinPattern format: "${pinPattern}". Falling back to rows/cols.`);
          }
        } catch (error) {
          console.error(`[Store] Error parsing pinPattern: "${pinPattern}"`, error);
        }
      }
       
       // Create default pins with all required fields if none are provided
       const pins = (connectorData.pins && connectorData.pins.length > 0) 
         ? connectorData.pins 
         : Array(actualRows * actualCols) // Generate default based on actual calculated dimensions
             .fill(0)
             .map((_, i): Pin => ({
               id: nanoid(), // Assign unique ID to each pin
               index: i,     // 0-based index
               number: i + 1, // Display number (1-based)
               pos: i + 1,   // Logical position (1-based)
               name: `Pin ${i + 1}`,
               row: Math.floor(i / actualCols), // Calculate row based on actualCols
               col: i % actualCols,             // Calculate col based on actualCols
               x: 0, // Placeholder X (Renderer should calculate actual)
               y: 0, // Placeholder Y (Renderer should calculate actual)
               connectedWireId: null,
               config: {},
               active: true,
               visible: true,
             }));
      
      return {
        connectors: [
          ...state.connectors,
          {
            ...connectorData,
            rows: actualRows, // Use calculated rows
            cols: actualCols, // Use calculated cols
            x: connectorData.x ?? 100, // Use provided x or default
            y: connectorData.y ?? 100, // Use provided y or default
            pins, // Ensure pins are included (either provided or generated)
            id,
          }
        ]
      };
    });
    return id;
  },
  
  updateConnector: (id: string, updates: Partial<Connector>) => set((state: WireMapperState) => ({
    connectors: state.connectors.map((c: Connector) => 
      c.id === id ? { ...c, ...updates } : c
    )
  })),
  
  removeConnector: (id: string) => set((state: WireMapperState) => {
    // Also remove mappings connected to this connector
    const updatedMappings = state.mappings.filter(m => 
      m.source.connectorId !== id && m.target.connectorId !== id
    );
    // Also remove wires connected to this connector
    const updatedWires = state.wires.filter(w => 
      w.source.connectorId !== id && w.target.connectorId !== id
    );
    return {
      connectors: state.connectors.filter(c => c.id !== id),
      mappings: updatedMappings,
      wires: updatedWires,
      selectedConnectorId: state.selectedConnectorId === id ? null : state.selectedConnectorId,
      selectedPin: state.selectedPin?.connectorId === id ? null : state.selectedPin,
    };
  }),
  
  setSelectedConnector: (connectorId: string | null) => set({
    selectedConnectorId: connectorId,
    selectedPin: null, // Deselect pin when selecting a connector
  }),
  
  updateConnectorPosition: (id: string, x: number, y: number) => set((state: WireMapperState) => ({
    connectors: state.connectors.map((c: Connector) => 
      c.id === id ? { 
        ...c, 
        // Update top-level x and y
        x: x, 
        y: y  
      } : c
    )
  })),
  
  rotateConnector: (id: string, rotation: number) => set((state: WireMapperState) => ({
    connectors: state.connectors.map((c: Connector) => 
      c.id === id ? { ...c, rotation } : c
    )
  })),
  
  // Pin actions
  updatePin: (connectorId: string, pinPos: number, updates: Partial<Pin>) => set((state: WireMapperState) => ({
    connectors: state.connectors.map((c) => 
      c.id === connectorId ? {
        ...c,
        pins: c.pins.map((p: Pin) => 
          p.pos === pinPos ? { ...p, ...updates } : p
        )
      } : c
    )
  })),
  
  updatePinDetailsAndNet: (connectorId: string, pinPos: number, updates: Partial<Pin>, netName?: string) => set(produce((draft: WireMapperState) => {
    const connector = draft.connectors.find((c: Connector) => c.id === connectorId);
    if (!connector) return;
    
    const pin = connector.pins.find((p: Pin) => p.pos === pinPos);
    if (!pin) return;
    
    // Update pin properties
    Object.assign(pin, updates);

    // If netName is provided and pin is mapped, update the mapping's net name
    if (netName !== undefined && pin.connectedWireId) {
      const mapping = draft.mappings.find((m: Mapping) => m.wireId === pin.connectedWireId);
      if (mapping) {
        mapping.netName = netName;
        // Update the net name on the other side of the mapping too
        const otherConnectorId = mapping.source.connectorId === connectorId ? mapping.target.connectorId : mapping.source.connectorId;
        const otherPinPos = mapping.source.connectorId === connectorId ? mapping.target.pinPos : mapping.source.pinPos;
        const otherConnector = draft.connectors.find((c: Connector) => c.id === otherConnectorId);
        const otherPin = otherConnector?.pins.find((p: Pin) => p.pos === otherPinPos);
        // Note: We don't update the other pin's name here, just the shared mapping netName.
      }
      // Update the wire associated with the mapping
      const wire = draft.wires.find((w: Wire) => w.id === pin.connectedWireId);
      if(wire) {
        wire.label = netName; // Update wire label to match net name
      }
    }
  })),

  setSelectedPin: (connectorId, pinPos) => set({
    selectedPin: connectorId && pinPos !== null ? { connectorId, pinPos } : null,
    // Deselect connector when selecting a pin
    selectedConnectorId: null,
  }),
  
  clearPinSelection: () => set({ selectedPin: null }),
  
  isPinConnected: (pinPos: number, connectorId: string) => {
    const mappings = get().mappings;
    return mappings.some(
      m =>
        (m.source.connectorId === connectorId && m.source.pinPos === pinPos) ||
        (m.target.connectorId === connectorId && m.target.pinPos === pinPos)
    );
  },
  
  setSelectedConnectorId: (id) => set({ selectedConnectorId: id, selectedPin: null }),
  
  // Mapping actions
  addMapping: (newMapping: Omit<Mapping, 'id' | 'wireId'>) => set(produce((draft: WireMapperState) => {
    const wireId = nanoid(); // Generate a unique ID for the wire and mapping
    
    // Find involved pins
    const sourceConnector = draft.connectors.find((c: Connector) => c.id === newMapping.source.connectorId);
    const targetConnector = draft.connectors.find((c: Connector) => c.id === newMapping.target.connectorId);
    const sourcePin = sourceConnector?.pins.find((p: Pin) => p.pos === newMapping.source.pinPos);
    const targetPin = targetConnector?.pins.find((p: Pin) => p.pos === newMapping.target.pinPos);
    
    if (!sourcePin || !targetPin) {
      console.error("Couldn't find pins for mapping:", newMapping);
      return; // Don't add mapping if pins aren't found
    }
    
    // Check if pins are already connected
    if (sourcePin.connectedWireId || targetPin.connectedWireId) {
       console.warn('One or both pins already connected, skipping mapping.');
       // Optionally remove existing mapping/wire or throw error
       return; 
    }

    // Assign wire ID to pins
    sourcePin.connectedWireId = wireId;
    targetPin.connectedWireId = wireId;
    
    // Add the mapping
    draft.mappings.push({
      id: wireId, // Add the missing 'id' property
      ...newMapping, // Spread the incoming properties (source, target, optional color)
      wireId, // Ensure this generated ID is used
      color: newMapping.color || getRandomHexColor(), // Use provided color or generate one
    });
    
    // Create and add the corresponding wire
    const wire = _createWireFromMapping(draft.mappings[draft.mappings.length - 1], sourcePin, targetPin);
    if (wire) {
      draft.wires.push(wire);
    }
  })),

  updateMapping: (id: string, updates: Partial<Omit<Mapping, 'id' | 'wireId'>>) => set(produce((draft: WireMapperState) => {
    const mappingIndex = draft.mappings.findIndex((m: Mapping) => m.id === id);
    if (mappingIndex === -1) return; // Mapping not found
    
    const originalMapping = draft.mappings[mappingIndex];
    const updatedMappingData = { ...originalMapping, ...updates };
    
    // Apply updates to the mapping
    draft.mappings[mappingIndex] = updatedMappingData;
    
    // If mapping details relevant to the wire changed (color, netName), update the wire
    const wire = draft.wires.find((w: Wire) => w.id === originalMapping.wireId);
    if (wire) {
      if (updates.color) wire.color = updates.color;
      // Removed updates.thickness check as Mapping doesn't have thickness
      if (updates.netName) wire.label = updates.netName; // Update wire label if netName changes
    }
    
    // Note: Updating source/target pins via this function is complex 
    // as it would require updating connectedWireId on the pins themselves.
    // It's generally safer to remove and re-add the mapping for structural changes.
  })),
  
  removeMapping: (id: string) => set(produce((draft: WireMapperState) => {
     const mappingIndex = draft.mappings.findIndex((m: Mapping) => m.id === id);
     if (mappingIndex === -1) return; // Not found
     
     const mappingToRemove = draft.mappings[mappingIndex];
     const wireId = mappingToRemove.wireId;
     
     // Find and disconnect pins
     const sourceConnector = draft.connectors.find((c: Connector) => c.id === mappingToRemove.source.connectorId);
     const targetConnector = draft.connectors.find((c: Connector) => c.id === mappingToRemove.target.connectorId);
     const sourcePin = sourceConnector?.pins.find((p: Pin) => p.pos === mappingToRemove.source.pinPos);
     const targetPin = targetConnector?.pins.find((p: Pin) => p.pos === mappingToRemove.target.pinPos);
     
     if (sourcePin) sourcePin.connectedWireId = null;
     if (targetPin) targetPin.connectedWireId = null;
     
     // Remove mapping
     draft.mappings.splice(mappingIndex, 1);
     
     // Remove associated wire
     const wireIndex = draft.wires.findIndex((w: Wire) => w.id === wireId);
     if (wireIndex !== -1) {
       draft.wires.splice(wireIndex, 1);
     }
  })),
}));

export default useWireMapperStore;
