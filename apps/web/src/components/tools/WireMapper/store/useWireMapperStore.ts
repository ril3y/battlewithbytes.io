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

// Convert HSL to RGB then to hex color
const hslToHex = (h: number, s: number, l: number): string => {
  // Keep hue between 0-360
  h = h % 360;
  if (h < 0) h += 360;
  
  // Keep saturation and lightness as percentages
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (60 <= h && h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (120 <= h && h < 180) {
    [r, g, b] = [0, c, x];
  } else if (180 <= h && h < 240) {
    [r, g, b] = [0, x, c];
  } else if (240 <= h && h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  // Convert to hex
  const toHex = (value: number) => {
    const hex = Math.round((value + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Generate visually distinct colors based on existing colors
const getRandomHexColor = (existingColors: string[] = []): string => {
  // Minimum color distance in HSL space to ensure colors are visually distinct
  const MIN_HUE_DISTANCE = 30; // minimum degrees between hues
  const SATURATION = 80; // fixed high saturation for vibrant colors
  const LIGHTNESS = 60; // fixed lightness for good visibility on dark backgrounds
  
  // If no existing colors, start with a random hue
  if (existingColors.length === 0) {
    const hue = Math.floor(Math.random() * 360);
    return hslToHex(hue, SATURATION, LIGHTNESS);
  }
  
  // Extract existing hues
  const existingHues: number[] = [];
  
  // We'll use a simple approximation to extract hue from hex colors
  existingColors.forEach(hex => {
    if (hex === '#ffffff' || hex === '#FFFFFF') return; // Skip white
    
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    // Approximate hue calculation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max === min) {
      h = 0; // achromatic
    } else {
      const d = max - min;
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      h *= 60;
    }
    
    existingHues.push(h);
  });
  
  // Find the largest gap in the hue circle
  existingHues.sort((a, b) => a - b);
  
  let maxGap = 360 - existingHues[existingHues.length - 1] + existingHues[0];
  let gapStart = existingHues[existingHues.length - 1];
  
  for (let i = 0; i < existingHues.length - 1; i++) {
    const gap = existingHues[i + 1] - existingHues[i];
    if (gap > maxGap) {
      maxGap = gap;
      gapStart = existingHues[i];
    }
  }
  
  // Place new hue in the middle of the largest gap
  const newHue = (gapStart + maxGap / 2) % 360;
  
  // If the gap is too small, shift the hue a bit to ensure distinction
  if (maxGap < MIN_HUE_DISTANCE) {
    // Pick a random offset between 15-45 degrees
    const offset = 15 + Math.floor(Math.random() * 30);
    return hslToHex((newHue + offset) % 360, SATURATION, LIGHTNESS);
  }
  
  return hslToHex(newHue, SATURATION, LIGHTNESS);
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

// Define a type for the copied net info
type CopiedNetInfo = {
  netName?: string;
  netColor?: string;
  voltage?: string;
  signalType?: string;
};

interface WireMapperState {
  projectName: string;
  connectors: Connector[];
  mappings: Mapping[];
  wires: Wire[];
  selectedPin: PinIdentifier | null;
  selectedConnectorId: string | null;
  focusedWireId: string | null; // Add focused wire state
  copiedNet: CopiedNetInfo | null; // For copy/paste net functionality
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
  duplicateConnector: (connectorId: string) => void; // Added duplicateConnector
  setSelectedConnector: (connectorId: string | null) => void;
  updateConnectorPosition: (id: string, x: number, y: number) => void;
  rotateConnector: (id: string, rotation: number) => void;
  
  // Pin actions
  updatePin: (connectorId: string, pinPos: number, updates: Partial<Pin>) => void;
  updatePinDetailsAndNet: (connectorId: string, pinPos: number, updates: Partial<Pin>, netNameProp?: string) => void;
  setSelectedPin: (connectorId: string | null, pinPos: number | null) => void;
  clearPinSelection: () => void;
  isPinConnected: (pinPos: number, connectorId: string) => boolean;
  setSelectedConnectorId: (id: string | null) => void;
  
  // Mapping actions
  addMapping: (newMapping: Omit<Mapping, 'id' | 'wireId'>) => void;
  updateMapping: (id: string, updates: Partial<Omit<Mapping, 'id' | 'wireId'>>) => void;
  removeMapping: (id: string) => void;
  setFocusedWireId: (id: string | null) => void; // Add setFocusedWireId action
  setCopiedNet: (copiedNet: CopiedNetInfo | null) => void; // Add setCopiedNet action
  copyNetFromPin: (connectorId: string, pinPos: number) => void;
  pasteNetToPin: (connectorId: string, pinPos: number) => void;
  resetPin: (connectorId: string, pinPos: number) => void; // Add resetPin action
}

export const useWireMapperStore = create<WireMapperState>((set, get) => {

  // Helper to disconnect a pin and remove its associated mapping/wire
  const _disconnectPin = (wireIdToRemove: string, draft: WireMapperState): boolean => {
    console.log(`[_disconnectPin] Start: Removing connection for wireId ${wireIdToRemove}`);

    // Find the mapping and wire to remove
    const mappingIndex = draft.mappings.findIndex(m => m.wireId === wireIdToRemove);
    const wireIndex = draft.wires.findIndex(w => w.id === wireIdToRemove);

    // Handle case where the mapping is missing (data inconsistency).
    if (mappingIndex === -1) {
      console.warn(`[_disconnectPin] Mapping not found for wireId ${wireIdToRemove}.`);
      // Attempt to remove the wire anyway if it exists, as it's now orphaned.
      if (wireIndex !== -1) {
        console.log(`[_disconnectPin] Removing orphaned wire ${wireIdToRemove}.`);
        draft.wires.splice(wireIndex, 1);
      }
      return false; // Indicate failure
    }

    // Get the mapping before removing it
    const mapping = draft.mappings[mappingIndex];

    console.log(`[_disconnectPin] Removing mapping index ${mappingIndex} for wire ${wireIdToRemove}.`);
    draft.mappings.splice(mappingIndex, 1);

    // Find and remove the associated wire.
    if (wireIndex !== -1) {
      console.log(`[_disconnectPin] Found wire index ${wireIndex} for wireId ${wireIdToRemove}. Removing wire.`);
      draft.wires.splice(wireIndex, 1);
    } else {
      console.warn(`[_disconnectPin] Wire object ${wireIdToRemove} not found for removed mapping.`);
    }

    // --- Disconnect BOTH pins involved in the removed mapping --- 
    const pinsToUpdate: PinIdentifier[] = [mapping.source, mapping.target];
    pinsToUpdate.forEach(pinIdentifier => {
      const connector = draft.connectors.find(c => c.id === pinIdentifier.connectorId);
      const pin = connector?.pins.find(p => p.pos === pinIdentifier.pinPos);
      if (pin) {
        const index = pin.connectedWireIds.indexOf(wireIdToRemove);
        if (index > -1) {
          pin.connectedWireIds.splice(index, 1); // Remove the specific wire ID
          console.log(`[_disconnectPin] Removed wire ${wireIdToRemove} from pin ${pinIdentifier.connectorId}-${pinIdentifier.pinPos}. Remaining: [${pin.connectedWireIds.join(', ')}]`);

          // If this was the last connection, clear the net name and set pin.config.color to undefined
          if (pin.connectedWireIds.length === 0) {
            pin.netName = undefined;
            pin.config.color = undefined; // Explicitly set to undefined to remove override
            console.log(`[_disconnectPin] Pin ${pinIdentifier.connectorId}-${pinIdentifier.pinPos} has no connections left. Cleared netName and set color to undefined.`);
          }
        } else {
          console.warn(`[_disconnectPin] Wire ${wireIdToRemove} not found in connectedWireIds of pin ${pinIdentifier.connectorId}-${pinIdentifier.pinPos}`);
        }
      } else {
        console.warn(`[_disconnectPin] Pin ${pinIdentifier.connectorId}-${pinIdentifier.pinPos} not found while trying to remove wire ${wireIdToRemove}.`);
      }
    });

    console.log(`[_disconnectPin] END: Finished removing connection for wireId ${wireIdToRemove}.`);
    return true; // Indicate success
  };

  // Helper function to propagate color and net name updates through a connected net
  const _propagateNetUpdates = (
    startPinIdentifier: PinIdentifier,
    newColor: string | undefined, // The new color to apply (can be undefined to clear)
    newNetName: string | undefined, // The new net name to apply (can be undefined to clear)
    draft: WireMapperState
  ) => {
    console.log(`[_propagateNetUpdates] START: Propagating from ${startPinIdentifier.connectorId}-${startPinIdentifier.pinPos} with Color=${newColor}, NetName=${newNetName}`);
    const queue: PinIdentifier[] = [startPinIdentifier];
    const visitedPins = new Set<string>(); // Keep track of visited pins (connectorId-pinPos)

    while (queue.length > 0) {
      const currentPinIdentifier = queue.shift()!;
      const visitedKey = `${currentPinIdentifier.connectorId}-${currentPinIdentifier.pinPos}`;

      if (visitedPins.has(visitedKey)) {
        console.log(`[_propagateNetUpdates] Pin ${visitedKey} already visited. Skipping.`);
        continue;
      }
      visitedPins.add(visitedKey);
      console.log(`[_propagateNetUpdates] Visiting pin ${visitedKey}`);

      const connector = draft.connectors.find(c => c.id === currentPinIdentifier.connectorId);
      const pin = connector?.pins.find(p => p.pos === currentPinIdentifier.pinPos);

      if (!pin) {
        console.warn(`[_propagateNetUpdates] Pin ${visitedKey} not found during propagation. Skipping.`);
        continue;
      }

      // Update the current pin's color and netName
      pin.config.color = newColor;
      pin.netName = newNetName; // Assign the net name (can be undefined)
      console.log(`[_propagateNetUpdates] Updated pin ${visitedKey}: Color=${pin.config.color}, NetName=${pin.netName}`);

      // If the pin has no connections, stop traversal for this branch
      if (!pin.connectedWireIds || pin.connectedWireIds.length === 0) {
        console.log(`[_propagateNetUpdates] Pin ${visitedKey} has no connections. Stopping traversal for this branch.`);
        continue;
      }

      // Iterate through ALL connected wires for the current pin
      for (const wireId of pin.connectedWireIds) {
        console.log(`[_propagateNetUpdates] Processing connection via wire ${wireId} for pin ${visitedKey}`);

        // Update the mapping associated with this wireId
        const mapping = draft.mappings.find(m => m.wireId === wireId);
        if (mapping) {
          console.log(`[_propagateNetUpdates] Found mapping ${mapping.id} for wire ${wireId}. Updating its color/netName.`);
          mapping.color = newColor;
          mapping.netName = newNetName;

          // Update the wire associated with this wireId
          const wire = draft.wires.find(w => w.id === wireId);
          if (wire) {
            console.log(`[_propagateNetUpdates] Found wire ${wire.id}. Updating its color.`);
            const effectiveWireColor = newColor ?? get().settings.defaultWireColor ?? '#ffffff'; // Ensure string
            wire.color = effectiveWireColor; // Assign the guaranteed string color
          } else {
            console.warn(`[_propagateNetUpdates] Wire object not found for wireId ${wireId} (mapping ${mapping.id}) during propagation`);
          }

          // Find the *other* pin connected by this mapping
          const otherPinIdentifier = 
              mapping.source.connectorId === currentPinIdentifier.connectorId && mapping.source.pinPos === currentPinIdentifier.pinPos
                  ? mapping.target
                  : mapping.source;

          const nextVisitedKey = `${otherPinIdentifier.connectorId}-${otherPinIdentifier.pinPos}`;

          // Queue the other pin for processing if not already visited
          if (!visitedPins.has(nextVisitedKey)) {
            console.log(`[_propagateNetUpdates] Queuing next pin ${nextVisitedKey} from mapping ${mapping.id}`);
            queue.push(otherPinIdentifier);
          } else {
            console.log(`[_propagateNetUpdates] Next pin ${nextVisitedKey} already visited/queued.`);
          }
        } else {
          console.warn(`[_propagateNetUpdates] Mapping object not found for pin ${visitedKey} (wireId: ${wireId}) during propagation`);
        }
      }
    }
    console.log(`[_propagateNetUpdates] END: Finished propagation starting from ${startPinIdentifier.connectorId}-${startPinIdentifier.pinPos}`);
  };

   // --- Return the store state and actions ---
   return {
     projectName: 'New Harness',
     connectors: [],
     mappings: [],
     wires: [], // Initialize wires array
     selectedPin: null,
     selectedConnectorId: null,
     focusedWireId: null, // Initialize focused wire as null
     copiedNet: null, // Initialize copied net as null
     settings: {
       connectionMode: 'normal', // Renamed from mode for clarity
       namePosition: 'above',
       simplifyConnections: true,
       snapToGrid: true,
       showGrid: true,
       gridSize: 20,
       defaultWireColor: '#ffffff', // Default wire color
       darkMode: true,
       showWires: true, // Added control for wire visibility
     },
     
     // Project actions
     setProjectName: (name: string) => set({ projectName: name }),
     
     loadProject: (project: WireMapperProject) => set({
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
         const pinPattern = typeof connectorData.config?.pinPattern === 'string' ? connectorData.config.pinPattern.trim() : undefined;

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
                  connectedWireIds: [], // Initialize as empty array
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
    
    duplicateConnector: (connectorId: string) => set((state: WireMapperState) => {
      const originalConnector = state.connectors.find(c => c.id === connectorId);
      if (!originalConnector) {
        console.error(`[Store] Connector not found for duplication: ${connectorId}`);
        return state; // Return current state if connector not found
      }

      // Generate a new name for the duplicated connector
      let newName = `${originalConnector.name}-copy`;
      let counter = 2;
      const existingNames = state.connectors.map(c => c.name);
      while (existingNames.includes(newName)) {
        newName = `${originalConnector.name}-copy-${counter}`;
        counter++;
      }

      const newConnector: Connector = {
        // Deep copy all properties from the original connector as a base.
        // This includes width, height, shape, type, gender, metadata, etc.
        ...(JSON.parse(JSON.stringify(originalConnector))),
        
        // Override specific properties for the new duplicated connector
        id: nanoid(), // New unique ID for the connector itself
        name: newName,
        x: (originalConnector.x ?? 0) + 30, // Ensure x/y are numbers before adding offset, default to 0 if undefined
        y: (originalConnector.y ?? 0) + 30,
        
        // Explicitly ensure rows and cols are carried over or defaulted to 1.
        // ConnectorNode.tsx also defaults these to 1 if undefined.
        rows: originalConnector.rows ?? 1,
        cols: originalConnector.cols ?? 1,

        // Deep copy config, ensuring it's an object even if originalConnector.config was undefined.
        config: originalConnector.config ? JSON.parse(JSON.stringify(originalConnector.config)) : {},

        // Create new pins based on original pins, but with new IDs and preserving all data properties
        pins: originalConnector.pins.map(originalPin => {
          return {
            // Required properties
            id: nanoid(),                  // New unique ID for the new pin
            index: originalPin.index,     // Copy original index
            pos: originalPin.pos,         // Copy position index
            name: originalPin.name,       // Copy name
            x: originalPin.x,             // Copy x position
            y: originalPin.y,             // Copy y position
            connectedWireIds: [],         // Reset connections (don't copy) 
            config: originalPin.config ? JSON.parse(JSON.stringify(originalPin.config)) : {}, // Deep clone config
            active: originalPin.active,   // Copy active state
            
            // Copy optional properties if they exist
            ...(originalPin.number !== undefined && { number: originalPin.number }),
            ...(originalPin.visible !== undefined && { visible: originalPin.visible }),
            ...(originalPin.row !== undefined && { row: originalPin.row }),
            ...(originalPin.col !== undefined && { col: originalPin.col }),
            
            // Copy net-related properties
            ...(originalPin.netName !== undefined && { netName: originalPin.netName }),
            ...(originalPin.netColor !== undefined && { netColor: originalPin.netColor }),
            ...(originalPin.desc !== undefined && { desc: originalPin.desc }),
            ...(originalPin.voltage !== undefined && { voltage: originalPin.voltage }),
            ...(originalPin.signalType !== undefined && { signalType: originalPin.signalType })
          };
        })
      };

      return {
        connectors: [...state.connectors, newConnector],
      };
    }),
    
    setSelectedConnector: (connectorId: string | null) => set(() => {
      return {
        selectedConnectorId: connectorId,
        selectedPin: null, // Deselect pin when selecting a connector
      };
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
    
    updatePinDetailsAndNet: (connectorId: string, pinPos: number, updates: Partial<Pin>, netNameProp?: string) => {
      console.log(`[updatePinDetailsAndNet] START: Updating pin ${connectorId}-${pinPos} with`, updates);
      set(produce((draft: WireMapperState) => {
        const connector = draft.connectors.find((c: Connector) => c.id === connectorId);
        if (!connector) { console.error(`Connector ${connectorId} not found`); return; }
        const pin = connector.pins.find((p: Pin) => p.pos === pinPos);
        if (!pin) { console.error(`Pin ${pinPos} on connector ${connectorId} not found`); return; }

        // Apply direct updates to the pin
        // Handle pin name update
        if (updates.name !== undefined) {
            console.log(`[updatePinDetailsAndNet] Updating pin name to: ${updates.name}`);
            pin.name = updates.name; // Directly update the pin's name
        }
        // Handle pin config update (color, etc.)
        if(updates.config) {
            pin.config = { ...(pin.config || {}), ...updates.config };
        }

        // Determine the target netName (passed prop > updates object > existing pin value)
        let targetNetName = netNameProp !== undefined ? netNameProp : (updates.netName !== undefined ? updates.netName : pin.netName);

        // --- Net Name Validation for UNCONNECTED pins --- 
        let allowNetNameUpdate = true;
        if (pin.connectedWireIds.length === 0 && targetNetName) { // Only validate if unconnected and setting a name
          console.log(`[updatePinDetailsAndNet] Pin ${connectorId}-${pinPos} is unconnected. Validating target net name: ${targetNetName}`);
          for (const otherConnector of draft.connectors) {
            for (const otherPin of otherConnector.pins) {
              // Skip self-comparison
              if (otherConnector.id === connectorId && otherPin.pos === pinPos) continue;

              // Check if other pin is also unconnected and has the target net name
              if (otherPin.connectedWireIds.length === 0 && otherPin.netName === targetNetName) {
                console.warn(`[updatePinDetailsAndNet] Validation FAILED: Unconnected pin ${otherConnector.id}-${otherPin.pos} already has net name '${targetNetName}'. Cannot assign to ${connectorId}-${pinPos}.`);
                allowNetNameUpdate = false;
                break; // Stop checking once a duplicate is found
              }
            }
            if (!allowNetNameUpdate) break; // Stop checking connectors too
          }
        }

        // Update the pin's netName only if validation passed or pin is connected/name is being cleared
        if (allowNetNameUpdate) {
            console.log(`[updatePinDetailsAndNet] Validation passed or not required. Updating net name for ${connectorId}-${pinPos} to: ${targetNetName}`);
            pin.netName = targetNetName;
        } else {
             console.log(`[updatePinDetailsAndNet] Keeping original net name for ${connectorId}-${pinPos} due to validation failure.`);
            // Optionally, revert targetNetName if needed elsewhere, though pin.netName is the source of truth now.
            targetNetName = pin.netName; // Keep the original value consistent
        }

        // Get the potentially updated color from the pin's config AFTER applying updates
        const newColor = pin.config?.color; // Can be undefined

        // If the pin is part of a net, propagate the updates
        if (pin.connectedWireIds.length) {
            const netNameToPropagate = pin.netName; // Use the potentially updated name
            console.log(`[updatePinDetailsAndNet] Pin is connected. Calling _propagateNetUpdates with Color=${newColor}, NetName=${netNameToPropagate}`);
            _propagateNetUpdates({ connectorId, pinPos }, newColor, netNameToPropagate, draft);
        } else {
            console.log(`[updatePinDetailsAndNet] Pin is not connected. Skipping propagation.`);
            // If not connected, still ensure its own color is set if provided in updates
            if (updates.config?.color !== undefined) {
                pin.config.color = updates.config.color;
            }
        }
      }));
      console.log(`[updatePinDetailsAndNet] END: Finished update for pin ${connectorId}-${pinPos}`);
    },

    setSelectedPin: (connectorId: string | null, pinPos: number | null) => set({ // Added types
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
    
    setSelectedConnectorId: (id: string | null) => set({ selectedConnectorId: id, selectedPin: null }), // Added type

    // Set the focused wire - when set, only this wire/net will be displayed
    setFocusedWireId: (id: string | null) => set(() => {
      return {
        focusedWireId: id,
        // Deselect connector and pin when setting focused wire
        selectedConnectorId: null,
        selectedPin: null,
      };
    }),

    // For copy/paste net functionality
    setCopiedNet: (netInfo: CopiedNetInfo | null) => set({
      copiedNet: netInfo
    }),
    
    // Copy net info from a specific pin
    copyNetFromPin: (connectorId: string, pinPos: number) => {
      const state = get();
      const connector = state.connectors.find(c => c.id === connectorId);
      if (!connector) return;
      
      const pin = connector.pins.find(p => p.pos === pinPos);
      if (!pin) return;
      
      // Extract net-related info from the pin
      const copiedNet: CopiedNetInfo = {
        netName: pin.netName,
        netColor: typeof pin.config?.color === 'string' ? pin.config.color : undefined, // Ensure color is a string
        voltage: typeof pin.voltage === 'string' ? pin.voltage : pin.voltage?.toString(), // Convert to string if it's a number
        signalType: pin.signalType
      };
      
      console.log("Copied net info:", copiedNet);
      set({ copiedNet });
    },
    
    // Paste copied net info to a specific pin
    pasteNetToPin: (connectorId: string, pinPos: number) => {
      const state = get();
      if (!state.copiedNet) return; // Nothing to paste
      
      // Create an update object that properly synchronizes netColor with config.color
      const updates = {
        ...state.copiedNet,
        // Ensure the pin.config.color is also updated with the netColor if available
        config: {
          color: state.copiedNet.netColor // Use netColor for the pin color
        }
      };
      
      console.log('Pasting net to pin with updates:', updates);
      
      // Update the pin with the copied net info
      const { updatePin } = get();
      updatePin(connectorId, pinPos, updates);
      
      // Clear the copiedNet after pasting to exit paste mode
      // This ensures the paste mode visual indicators are cleared
      setTimeout(() => {
        const { setCopiedNet } = get();
        setCopiedNet(null);
      }, 100); // Small delay to ensure the update completes first
    },
    
    // Reset a pin to its default state (clear net information and remove connections)
    resetPin: (connectorId: string, pinPos: number) => {
      console.log(`Resetting pin ${connectorId}-${pinPos}`);
      
      const state = get();
      
      // Find the connector and pin
      const connector = state.connectors.find(c => c.id === connectorId);
      if (!connector) return;
      
      const pin = connector.pins.find(p => p.pos === pinPos);
      if (!pin) return;
      
      // First, check if the pin has any connections
      if (pin.connectedWireIds && pin.connectedWireIds.length > 0) {
        // Store wire IDs that need to be removed
        const wireIdsToRemove = [...pin.connectedWireIds];
        
        // For each wire, find and remove the corresponding mapping
        wireIdsToRemove.forEach(wireId => {
          const mapping = state.mappings.find(m => m.wireId === wireId);
          if (mapping) {
            // Remove the mapping using the existing removeMapping action
            state.removeMapping(mapping.id);
          }
        });
      }
      
      // Create an update object that clears all net-related information
      const resetUpdates = {
        netName: undefined,
        netColor: undefined,
        voltage: undefined,
        signalType: undefined,
        config: {
          color: undefined // Clear the pin color
        },
        connectedWireIds: [] // Clear connections
      };
      
      // Update the pin with the reset values
      const { updatePin } = get();
      updatePin(connectorId, pinPos, resetUpdates);
    },

    // Mapping actions
    addMapping: (newMapping: Omit<Mapping, 'id' | 'wireId'>) => set(produce((draft: WireMapperState) => {
      console.log(`[addMapping] Start: Source=${newMapping.source.connectorId}-${newMapping.source.pinPos}, Target=${newMapping.target.connectorId}-${newMapping.target.pinPos}`);

// ... (rest of the code remains the same)
       // 1. Disconnect existing connections if pins are already mapped // <-- REMOVING THIS BEHAVIOR
       /*
        if (newMapping.source.connectorId && newMapping.source.pinPos) {
          const sourcePinCheck = draft.connectors.find(c => c.id === newMapping.source.connectorId)?.pins.find(p => p.pos === newMapping.source.pinPos);
          if (sourcePinCheck?.connectedWireId) {
            console.log(`[addMapping] Source pin ${newMapping.source.connectorId}-${newMapping.source.pinPos} already connected to wire ${sourcePinCheck.connectedWireId}. Disconnecting old mapping.`);
            _disconnectPin(newMapping.source, draft); // Disconnect source
          } else {
            console.log(`[addMapping] Source pin ${newMapping.source.connectorId}-${newMapping.source.pinPos} is not connected.`);
          }
        }
        if (newMapping.target.connectorId && newMapping.target.pinPos) {
          const targetPinCheck = draft.connectors.find(c => c.id === newMapping.target.connectorId)?.pins.find(p => p.pos === newMapping.target.pinPos);
          if (targetPinCheck?.connectedWireId) {
            console.log(`[addMapping] Target pin ${newMapping.target.connectorId}-${newMapping.target.pinPos} already connected to wire ${targetPinCheck.connectedWireId}. Disconnecting old mapping.`);
            _disconnectPin(newMapping.target, draft); // Disconnect target
          } else {
            console.log(`[addMapping] Target pin ${newMapping.target.connectorId}-${newMapping.target.pinPos} is not connected.`);
          }
        }
       */
 
        // 2. Determine the authoritative color and netName for the new connection
        // Priority: Source Pin > Target Pin (if source has no specific values) > Default
        // Note: The check for existing connection was moved above, so we don't need to check here.
        const sourcePinState = draft.connectors.find(c => c.id === newMapping.source.connectorId)?.pins.find(p => p.pos === newMapping.source.pinPos);
        const sourceColor = sourcePinState?.config?.color;
        const sourceNetName = sourcePinState?.netName;

        const targetPinState = draft.connectors.find(c => c.id === newMapping.target.connectorId)?.pins.find(p => p.pos === newMapping.target.pinPos);
        const targetColor = targetPinState?.config?.color;
        const targetNetName = targetPinState?.netName;

        // Get all existing colors from mappings/connections
        // Filter out undefined values and only keep valid color strings
        const existingColors = draft.mappings
          .map(m => m.color)
          .filter((color): color is string => color !== undefined);
        
        // Generate a visually distinct color using our improved algorithm
        // This ensures maximum color distance from existing connections
        const newColor = getRandomHexColor(existingColors);
        
        // Use source's values if they exist, otherwise target's, otherwise use the new distinct color
        const authoritativeColor = sourceColor ?? targetColor ?? newColor;
        const authoritativeNetName = sourceNetName !== undefined ? sourceNetName : targetNetName; // Can be undefined
        console.log(`[addMapping] Determined authoritative Color: ${authoritativeColor}, NetName: ${authoritativeNetName}`);

        // 3. Create the new mapping and wire
        const newWireId = nanoid(); // Unique ID for this connection
        console.log(`[addMapping] Generated new Wire ID: ${newWireId}`);

        // Find involved pins AGAIN - their state might have changed if _disconnectPin was called
        const sourceConnector = draft.connectors.find((c: Connector) => c.id === newMapping.source.connectorId);
        const targetConnector = draft.connectors.find((c: Connector) => c.id === newMapping.target.connectorId);
        const sourcePin = sourceConnector?.pins.find((p: Pin) => p.pos === newMapping.source.pinPos);
        const targetPin = targetConnector?.pins.find((p: Pin) => p.pos === newMapping.target.pinPos);

        if (!sourcePin || !targetPin) {
          console.error("Couldn't find pins for mapping:", newMapping);
          return; // Don't add mapping if pins aren't found
        }

        // Create the final mapping object with all details
        const finalMapping: Mapping = {
          id: newWireId,
          wireId: newWireId,
          source: newMapping.source,
          target: newMapping.target,
          color: authoritativeColor,
          netName: authoritativeNetName,
        };

        draft.mappings.push(finalMapping);

        // Set connectedWireId on pins *after* creating mapping (needed by _createWire)
        console.log(`[addMapping] Adding wireId ${newWireId} to connectedWireIds for Source Pin ${sourcePin.pos} and Target Pin ${targetPin.pos}`);
        // Ensure the arrays exist before pushing
        if (!Array.isArray(sourcePin.connectedWireIds)) sourcePin.connectedWireIds = [];
        if (!Array.isArray(targetPin.connectedWireIds)) targetPin.connectedWireIds = [];
        // Add the new wire ID if it's not already present (shouldn't happen with nanoid, but good practice)
        if (!sourcePin.connectedWireIds.includes(newWireId)) {
          sourcePin.connectedWireIds.push(newWireId);
        }
        if (!targetPin.connectedWireIds.includes(newWireId)) {
          targetPin.connectedWireIds.push(newWireId);
        }

        // Create and add the corresponding wire
        console.log(`[addMapping] Creating wire object for mapping ${finalMapping.id}`);
        const wire = _createWireFromMapping(finalMapping, sourcePin, targetPin);
        if (wire) {
          console.log(`[addMapping] Adding wire ${wire.id} to state.`);
          draft.wires.push(wire);
        } else {
          console.warn(`[addMapping] Failed to create wire object.`);
        }

        // 4. Propagate the authoritative color and netName through the newly formed net
        // Start propagation from the source pin
        console.log(`[addMapping] Calling _propagateNetUpdates starting from source pin ${newMapping.source.connectorId}-${newMapping.source.pinPos} with Color=${authoritativeColor}, NetName=${authoritativeNetName}`);
        _propagateNetUpdates(newMapping.source, authoritativeColor, authoritativeNetName, draft);
        // --- End Net Merging/Creation Logic ---
        console.log(`[addMapping] End: Successfully added mapping ${newWireId}`);
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
  
    // Remove a mapping by its ID
    removeMapping: (mappingId: string) => set(produce((draft: WireMapperState) => {
        const mappingToRemove = draft.mappings.find(m => m.id === mappingId);
       
        if (!mappingToRemove) {
          console.warn(`Mapping with id ${mappingId} not found for removal.`);
          return;
        }

        const wireIdToRemove = mappingToRemove.wireId;
        console.log(`[removeMapping] Removing mapping ${mappingId} (Wire ID: ${wireIdToRemove})`);
        // Call the updated disconnect helper, passing the specific wire ID
        _disconnectPin(wireIdToRemove, draft);
        // _disconnectPin now handles removing the mapping and wire objects as well.
      })),
  };
}); // End of create

export default useWireMapperStore;
