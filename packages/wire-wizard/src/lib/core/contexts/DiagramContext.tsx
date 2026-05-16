import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Block, Wire, ConnectionPoint, BendPoint, DiagramData } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../../persistence/fileOperations';
import { snapToGrid } from '../utils';
import {
  CONNECTION_POINT_COLORS,
  DEFAULT_GRID_SIZE,
  DEFAULT_BLOCKS
} from '../constants';
import { useHistory } from '../../persistence/useHistory';
import { getComponent } from '../../component-library';

/**
 * Normalize legacy `Block.componentType` values like 'power-distribution/bus-bar'
 * to the new flat library IDs ('bus-bar') used by the component-library registry.
 */
function migrateBlockComponentType(block: Block): Block {
  if (!block.componentType) return block;
  // Already a registered library ID — nothing to do.
  if (getComponent(block.componentType)) return block;
  // Try stripping a category prefix.
  const stripped = block.componentType.replace(/^[^/]+\//, '');
  if (stripped !== block.componentType && getComponent(stripped)) {
    return { ...block, componentType: stripped };
  }
  return block;
}

/**
 * DiagramContext - Manages core diagram state
 *
 * Replaces prop drilling for:
 * - blocks, setBlocks
 * - wires, setWires
 * - busGroups, setBusGroups
 * - updateBlock, updateWire, updateConnectionPoint
 * - removeBlock, removeWire
 * - addConnectionPoint, removeConnectionPoint
 * - addBendPoint, removeBendPoint
 * - saveToHistory
 */

export interface BusGroupData {
  name: string;
  rotation?: number;
  color?: string;
}

interface DiagramContextValue {
  // Core state
  blocks: Block[];
  wires: Wire[];
  busGroups: Record<string, BusGroupData>;
  gridSize: number;
  isLoaded: boolean;

  // Block operations
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  removeBlock: (blockId: string) => void;
  addBlock: (block: Block) => void;

  // Connection point operations
  addConnectionPoint: (blockId: string, point?: Partial<ConnectionPoint>) => void;
  updateConnectionPoint: (blockId: string, pointId: string, updates: Partial<ConnectionPoint>) => void;
  removeConnectionPoint: (blockId: string, pointId: string) => void;

  // Wire operations
  setWires: React.Dispatch<React.SetStateAction<Wire[]>>;
  addWire: (wire: Wire) => void;
  updateWire: (wireId: string, updates: Partial<Wire>) => void;
  removeWire: (wireId: string) => void;

  // Bend point operations
  addBendPointToWire: (wireId: string, point?: BendPoint) => void;
  addBendPointAtPosition: (wireId: string, x: number, y: number, segmentIndex?: number) => void;
  removeBendPoint: (wireId: string, bendIndex: number) => void;

  // Bus group operations
  setBusGroups: React.Dispatch<React.SetStateAction<Record<string, BusGroupData>>>;

  // Grid operations
  setGridSize: (size: number) => void;

  // History operations
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Utility functions
  getBlockById: (blockId: string) => Block | undefined;
  getWireById: (wireId: string) => Wire | undefined;
  getConnectionPoint: (blockId: string, pointId: string) => ConnectionPoint | undefined;
  getGlobalPosition: (blockId: string, pointId: string) => { x: number; y: number };
}

const DiagramContext = createContext<DiagramContextValue | null>(null);

// CONNECTION_POINT_COLORS imported from constants

interface DiagramProviderProps {
  children: ReactNode;
  initialData?: Partial<DiagramData>;
  /**
   * localStorage key for autosave / autoload. Set to `null` to disable both
   * (used by the read-only viewer and the iframe embed route).
   * Defaults to `'wire-wizard-diagram'` for backward compat.
   */
  storageKey?: string | null;
}

export function DiagramProvider({ children, initialData, storageKey = 'wire-wizard-diagram' }: DiagramProviderProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialData?.blocks ?? DEFAULT_BLOCKS);
  const [wires, setWires] = useState<Wire[]>(initialData?.wires ?? []);
  const [busGroups, setBusGroups] = useState<Record<string, BusGroupData>>(initialData?.busGroups ?? {});
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize history
  const history = useHistory({
    blocks: initialData?.blocks ?? DEFAULT_BLOCKS,
    wires: initialData?.wires ?? [],
    busGroups: initialData?.busGroups ?? {},
    version: '1.0'
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage(storageKey);
    if (saved) {
      const migratedBlocks = saved.blocks.map(migrateBlockComponentType);
      setBlocks(migratedBlocks);
      setWires(saved.wires);
      if (saved.busGroups) {
        // Clean up stale bus groups (that have no wires)
        const cleanedBusGroups: Record<string, BusGroupData> = {};
        Object.entries(saved.busGroups).forEach(([busId, busData]) => {
          const wiresInBus = saved.wires.filter(w => w.busGroupId === busId);
          if (wiresInBus.length > 0) {
            cleanedBusGroups[busId] = busData;
          }
        });
        setBusGroups(cleanedBusGroups);
      }
      // Reset history with migrated data
      history.resetHistory({ ...saved, blocks: migratedBlocks });
    }
    setIsLoaded(true);
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      saveToLocalStorage({ blocks, wires, busGroups, version: '1.0' }, storageKey);
    }
  }, [blocks, wires, busGroups, isLoaded, storageKey]);

  // History operations
  const saveToHistory = useCallback(() => {
    history.saveToHistory({ blocks, wires, busGroups, version: '1.0' });
  }, [blocks, wires, busGroups, history]);

  const undo = useCallback(() => {
    const previousState = history.undo();
    if (previousState) {
      setBlocks(previousState.blocks);
      setWires(previousState.wires);
      setBusGroups(previousState.busGroups || {});
    }
  }, [history]);

  const redo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) {
      setBlocks(nextState.blocks);
      setWires(nextState.wires);
      setBusGroups(nextState.busGroups || {});
    }
  }, [history]);

  // Block operations
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...updates } : b));
  }, []);

  // Removed duplicate removeBlock
  /*
      // Find the block and calculate global positions of its connection points
      // so we can detach wires to those specific coordinates
      const block = blocks.find(b => b.id === blockId);

      if (block) {
        const pointPositions: Record<string, { x: number; y: number }> = {};
        block.connectionPoints.forEach(cp => {
          pointPositions[cp.id] = getGlobalPosition(blockId, cp.id);
        });

        // Update wires: detach from this block and set loose coordinates
        setWires(prev => prev.map(w => {
          // If wire is not connected to this block, return as is
          if (w.fromBlockId !== blockId && w.toBlockId !== blockId) {
            return w;
          }

          const updated = { ...w };

          // Handle start point
          if (w.fromBlockId === blockId && w.fromPointId) {
            const pos = pointPositions[w.fromPointId];
            if (pos) {
              delete updated.fromBlockId;
              delete updated.fromPointId;
              updated.fromLooseX = pos.x;
              updated.fromLooseY = pos.y;
            }
          }

          // Handle end point
          if (w.toBlockId === blockId && w.toPointId) {
            const pos = pointPositions[w.toPointId];
            if (pos) {
              delete updated.toBlockId;
              delete updated.toPointId;
              updated.toLooseX = pos.x;
              updated.toLooseY = pos.y;
            }
          }

          return updated;
        }));
      }

      // Remove block
      setBlocks(prev => prev.filter(b => b.id !== blockId));
  */

  const addBlock = useCallback((block: Block) => {
    setBlocks(prev => [...prev, block]);
  }, []);

  // Connection point operations
  const addConnectionPoint = useCallback((blockId: string, pointOverrides?: Partial<ConnectionPoint>) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;

      const numPoints = block.connectionPoints.length;
      const side = numPoints % 4;
      const position = Math.floor(numPoints / 4) + 1;
      const spacing = 30;

      let x: number, y: number;
      switch (side) {
        case 0: x = 0; y = snapToGrid(position * spacing, gridSize); break;
        case 1: x = snapToGrid(position * spacing, gridSize); y = 0; break;
        case 2: x = block.width; y = snapToGrid(position * spacing, gridSize); break;
        case 3: x = snapToGrid(position * spacing, gridSize); y = block.height; break;
        default: x = block.width / 2; y = block.height / 2;
      }

      const randomColor = CONNECTION_POINT_COLORS[Math.floor(Math.random() * CONNECTION_POINT_COLORS.length)];

      const newPoint: ConnectionPoint = {
        id: `cp_${Date.now()}`,
        x: snapToGrid(x, gridSize),
        y: snapToGrid(y, gridSize),
        label: 'New',
        color: randomColor,
        voltage: 12,
        ...pointOverrides,
      };

      return {
        ...block,
        connectionPoints: [...block.connectionPoints, newPoint]
      };
    }));
  }, [gridSize]);

  const updateConnectionPoint = useCallback((blockId: string, pointId: string, updates: Partial<ConnectionPoint>) => {
    const snappedUpdates = { ...updates };
    if (updates.x !== undefined) {
      snappedUpdates.x = snapToGrid(updates.x, gridSize);
    }
    if (updates.y !== undefined) {
      snappedUpdates.y = snapToGrid(updates.y, gridSize);
    }

    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      return {
        ...block,
        connectionPoints: block.connectionPoints.map(p =>
          p.id === pointId ? { ...p, ...snappedUpdates } : p
        )
      };
    }));
  }, [gridSize]);

  const removeConnectionPoint = useCallback((blockId: string, pointId: string) => {
    // Remove wires connected to this point
    setWires(prev => prev.filter(w =>
      !(w.fromBlockId === blockId && w.fromPointId === pointId) &&
      !(w.toBlockId === blockId && w.toPointId === pointId)
    ));

    // Remove point
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      return {
        ...block,
        connectionPoints: block.connectionPoints.filter(p => p.id !== pointId)
      };
    }));
  }, []);

  // Wire operations
  const addWire = useCallback((wire: Wire) => {
    setWires(prev => [...prev, wire]);
  }, []);

  const updateWire = useCallback((wireId: string, updates: Partial<Wire>) => {
    setWires(prev => prev.map(w => w.id === wireId ? { ...w, ...updates } : w));
  }, []);

  const removeWire = useCallback((wireId: string) => {
    setWires(prev => {
      const wireToRemove = prev.find(w => w.id === wireId);
      let updatedWires = prev.filter(w => w.id !== wireId);

      // Clean up orphaned junction points
      if (wireToRemove) {
        const junctionsToCheck: Array<{ x: number; y: number }> = [];

        if (wireToRemove.fromJunctionX !== undefined && wireToRemove.fromJunctionY !== undefined) {
          junctionsToCheck.push({ x: wireToRemove.fromJunctionX, y: wireToRemove.fromJunctionY });
        }
        if (wireToRemove.toJunctionX !== undefined && wireToRemove.toJunctionY !== undefined) {
          junctionsToCheck.push({ x: wireToRemove.toJunctionX, y: wireToRemove.toJunctionY });
        }

        junctionsToCheck.forEach(junction => {
          const otherWiresUsingJunction = updatedWires.filter(w =>
            (w.fromJunctionX === junction.x && w.fromJunctionY === junction.y) ||
            (w.toJunctionX === junction.x && w.toJunctionY === junction.y)
          );

          if (otherWiresUsingJunction.length === 1) {
            const orphanedWire = otherWiresUsingJunction[0];
            updatedWires = updatedWires.map(w => {
              if (w.id !== orphanedWire.id) return w;
              const updated = { ...w };
              if (w.fromJunctionX === junction.x && w.fromJunctionY === junction.y) {
                delete updated.fromJunctionX;
                delete updated.fromJunctionY;
              }
              if (w.toJunctionX === junction.x && w.toJunctionY === junction.y) {
                delete updated.toJunctionX;
                delete updated.toJunctionY;
              }
              return updated;
            });

            updatedWires = updatedWires.filter(w => {
              if (w.id !== orphanedWire.id) return true;
              const hasValidFrom = w.fromBlockId || (w.fromJunctionX !== undefined && w.fromJunctionY !== undefined);
              const hasValidTo = w.toBlockId || (w.toJunctionX !== undefined && w.toJunctionY !== undefined);
              return hasValidFrom && hasValidTo;
            });
          }
        });

        // Clean up empty bus groups
        if (wireToRemove.busGroupId) {
          const remainingWiresInBus = updatedWires.filter(w => w.busGroupId === wireToRemove.busGroupId);
          if (remainingWiresInBus.length === 0) {
            setBusGroups(prev => {
              const { [wireToRemove.busGroupId!]: _, ...rest } = prev;
              return rest;
            });
          }
        }
      }

      return updatedWires;
    });
  }, []);

  // Bend point operations
  const addBendPointToWire = useCallback((wireId: string, point?: BendPoint) => {
    setWires(prev => prev.map(wire => {
      if (wire.id !== wireId) return wire;

      let newBendPoint: BendPoint;
      if (point) {
        newBendPoint = {
          x: snapToGrid(point.x, gridSize),
          y: snapToGrid(point.y, gridSize)
        };
      } else {
        // Add at midpoint if no position specified
        const fromBlock = blocks.find(b => b.id === wire.fromBlockId);
        const toBlock = blocks.find(b => b.id === wire.toBlockId);
        const fromPoint = fromBlock?.connectionPoints.find(p => p.id === wire.fromPointId);
        const toPoint = toBlock?.connectionPoints.find(p => p.id === wire.toPointId);

        const fromX = fromBlock && fromPoint ? fromBlock.x + fromPoint.x : 0;
        const fromY = fromBlock && fromPoint ? fromBlock.y + fromPoint.y : 0;
        const toX = toBlock && toPoint ? toBlock.x + toPoint.x : 0;
        const toY = toBlock && toPoint ? toBlock.y + toPoint.y : 0;

        newBendPoint = {
          x: snapToGrid((fromX + toX) / 2, gridSize),
          y: snapToGrid((fromY + toY) / 2, gridSize)
        };
      }

      return { ...wire, bendPoints: [...wire.bendPoints, newBendPoint] };
    }));
  }, [blocks, gridSize]);

  const addBendPointAtPosition = useCallback((wireId: string, x: number, y: number, segmentIndex?: number) => {
    setWires(prev => prev.map(wire => {
      if (wire.id !== wireId) return wire;

      const newBendPoint = {
        x: snapToGrid(x, gridSize),
        y: snapToGrid(y, gridSize)
      };

      const newBendPoints = [...wire.bendPoints];
      if (segmentIndex !== undefined && segmentIndex >= 0) {
        newBendPoints.splice(segmentIndex, 0, newBendPoint);
      } else {
        newBendPoints.push(newBendPoint);
      }

      return { ...wire, bendPoints: newBendPoints };
    }));
  }, [gridSize]);

  const removeBendPoint = useCallback((wireId: string, bendIndex: number) => {
    setWires(prev => prev.map(wire => {
      if (wire.id !== wireId) return wire;
      return {
        ...wire,
        bendPoints: wire.bendPoints.filter((_, i) => i !== bendIndex)
      };
    }));
  }, []);

  // Utility functions
  const getBlockById = useCallback((blockId: string): Block | undefined => {
    return blocks.find(b => b.id === blockId);
  }, [blocks]);

  const getWireById = useCallback((wireId: string): Wire | undefined => {
    return wires.find(w => w.id === wireId);
  }, [wires]);

  const getConnectionPoint = useCallback((blockId: string, pointId: string): ConnectionPoint | undefined => {
    const block = blocks.find(b => b.id === blockId);
    return block?.connectionPoints.find(p => p.id === pointId);
  }, [blocks]);

  const getGlobalPosition = useCallback((blockId: string, pointId: string): { x: number; y: number } => {
    const block = blocks.find(b => b.id === blockId);
    const point = block?.connectionPoints.find(p => p.id === pointId);

    if (!block || !point) {
      return { x: 0, y: 0 };
    }

    // Handle rotation
    const rotation = block.rotation || 0;
    const cx = block.width / 2;
    const cy = block.height / 2;

    // Translate point to center, rotate, translate back
    const rad = (rotation * Math.PI) / 180;
    const dx = point.x - cx;
    const dy = point.y - cy;

    const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad) + cx;
    const rotatedY = dx * Math.sin(rad) + dy * Math.cos(rad) + cy;

    return {
      x: block.x + rotatedX,
      y: block.y + rotatedY
    };
  }, [blocks]);

  const removeBlock = useCallback((blockId: string) => {
    // Find the block and calculate global positions of its connection points
    // so we can detach wires to those specific coordinates
    const block = blocks.find(b => b.id === blockId);

    if (block) {
      const pointPositions: Record<string, { x: number; y: number }> = {};
      block.connectionPoints.forEach(cp => {
        pointPositions[cp.id] = getGlobalPosition(blockId, cp.id);
      });

      // Update wires: detach from this block and set loose coordinates
      setWires(prev => prev.map(w => {
        // If wire is not connected to this block, return as is
        if (w.fromBlockId !== blockId && w.toBlockId !== blockId) {
          return w;
        }

        const updated = { ...w };

        // Handle start point
        if (w.fromBlockId === blockId && w.fromPointId) {
          const pos = pointPositions[w.fromPointId];
          if (pos) {
            delete updated.fromBlockId;
            delete updated.fromPointId;
            updated.fromLooseX = pos.x;
            updated.fromLooseY = pos.y;
          }
        }

        // Handle end point
        if (w.toBlockId === blockId && w.toPointId) {
          const pos = pointPositions[w.toPointId];
          if (pos) {
            delete updated.toBlockId;
            delete updated.toPointId;
            updated.toLooseX = pos.x;
            updated.toLooseY = pos.y;
          }
        }

        return updated;
      }));
    }

    // Remove block
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  }, [blocks, getGlobalPosition]);

  const value: DiagramContextValue = {
    // Core state
    blocks,
    wires,
    busGroups,
    gridSize,
    isLoaded,

    // Block operations
    setBlocks,
    updateBlock,
    removeBlock,
    addBlock,

    // Connection point operations
    addConnectionPoint,
    updateConnectionPoint,
    removeConnectionPoint,

    // Wire operations
    setWires,
    addWire,
    updateWire,
    removeWire,

    // Bend point operations
    addBendPointToWire,
    addBendPointAtPosition,
    removeBendPoint,

    // Bus group operations
    setBusGroups,

    // Grid operations
    setGridSize,

    // History operations
    saveToHistory,
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,

    // Utility functions
    getBlockById,
    getWireById,
    getConnectionPoint,
    getGlobalPosition,
  };

  return (
    <DiagramContext.Provider value={value}>
      {children}
    </DiagramContext.Provider>
  );
}

export function useDiagram(): DiagramContextValue {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagram must be used within a DiagramProvider');
  }
  return context;
}

// Convenience hooks for specific operations
export function useBlocks() {
  const { blocks, setBlocks, updateBlock, removeBlock, addBlock } = useDiagram();
  return { blocks, setBlocks, updateBlock, removeBlock, addBlock };
}

export function useWires() {
  const { wires, setWires, addWire, updateWire, removeWire } = useDiagram();
  return { wires, setWires, addWire, updateWire, removeWire };
}

export function useBusGroups() {
  const { busGroups, setBusGroups } = useDiagram();
  return { busGroups, setBusGroups };
}
