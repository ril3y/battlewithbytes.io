/**
 * Component Config Hook
 *
 * Drives the picker → config → block creation flow.
 */

import { useState, useCallback } from 'react';
import type { Block, ConnectionPoint, Wire } from '../../core/types';
import { snapToGrid } from '../../core/utils';
import {
  generateComponent,
  getComponent,
  type ComponentDefinition,
} from '../../component-library';

interface UseComponentConfigProps {
  blocks: Block[];
  wires: Wire[];
  setBlocks: (blocks: Block[]) => void;
  setWires: (wires: Wire[]) => void;
  setSelectedBlockId: (id: string | null) => void;
  saveToHistory: () => void;
  pan: { x: number; y: number };
  zoom: number;
  GRID_SIZE: number;
}

function defaultConfigFor(component: ComponentDefinition): Record<string, unknown> {
  const config: Record<string, unknown> = {};
  Object.entries(component.metadata.config).forEach(([key, field]) => {
    config[key] = field.default;
  });
  return config;
}

/**
 * Framework-level config keys whose values live on the Block itself rather
 * than inside Block.componentConfig. This hook owns the bridge between the
 * config-form values and those Block fields.
 */
const FRAMEWORK_KEYS = new Set(['scale', 'wiresOnTop']);

function partitionConfig(config: Record<string, unknown>): {
  componentConfig: Record<string, unknown>;
  wiresOnTop: boolean | undefined;
} {
  const componentConfig: Record<string, unknown> = {};
  let wiresOnTop: boolean | undefined;
  for (const [k, v] of Object.entries(config)) {
    if (k === 'wiresOnTop') {
      wiresOnTop = !!v;
    } else if (FRAMEWORK_KEYS.has(k)) {
      // `scale` stays in componentConfig — generators read it.
      componentConfig[k] = v;
    } else {
      componentConfig[k] = v;
    }
  }
  return { componentConfig, wiresOnTop };
}

function libraryPointsToConnectionPoints(
  result: ReturnType<typeof generateComponent>,
): ConnectionPoint[] {
  return result.connectionPoints.map((cp) => ({
    id: cp.id,
    x: cp.x,
    y: cp.y,
    label: cp.label,
    color: cp.color ?? '#9aa0a6',
    shape: cp.shape,
    radius: cp.radius,
    voltage: cp.voltage,
    currentRating: cp.currentRating,
    description: cp.description,
    labelOffsetX: cp.labelOffsetX,
    labelOffsetY: cp.labelOffsetY,
    isGenerated: true,
  }));
}

export function useComponentConfig({
  blocks,
  wires,
  setBlocks,
  setWires,
  setSelectedBlockId,
  saveToHistory,
  pan,
  zoom,
  GRID_SIZE,
}: UseComponentConfigProps) {
  const [componentToConfig, setComponentToConfig] = useState<ComponentDefinition | null>(null);
  const [blockIdToEdit, setBlockIdToEdit] = useState<string | null>(null);

  /**
   * Handle selection of a non-configurable component from the picker.
   * Creates a new block using the library generator's defaults.
   */
  const handleComponentSelect = useCallback((component: ComponentDefinition) => {
    const config = defaultConfigFor(component);
    const result = generateComponent(component.metadata.id, config);
    const { width, height } = result.dimensions;
    const { componentConfig, wiresOnTop } = partitionConfig(config);

    const viewportCenterX = -pan.x + (window.innerWidth / 2) / zoom;
    const viewportCenterY = -pan.y + (window.innerHeight / 2) / zoom;

    const newBlock: Block = {
      id: `block_${Date.now()}`,
      x: snapToGrid(viewportCenterX - width / 2, GRID_SIZE),
      y: snapToGrid(viewportCenterY - height / 2, GRID_SIZE),
      width,
      height,
      label: component.metadata.name,
      color: '#ffffff',
      shape: 'rectangle',
      connectionPoints: libraryPointsToConnectionPoints(result),
      svgComponent: 'generated',
      svgViewBox: `0 0 ${width} ${height}`,
      componentConfig,
      componentType: component.metadata.id,
      rotation: 0,
      wiresOnTop: wiresOnTop ?? true,
    };

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    saveToHistory();
  }, [blocks, setBlocks, setSelectedBlockId, saveToHistory, pan, zoom, GRID_SIZE]);

  /**
   * Handle selection of a configurable component - open config modal (for NEW components)
   */
  const handleConfigurableComponent = useCallback((component: ComponentDefinition) => {
    setBlockIdToEdit(null);
    setComponentToConfig(component);
  }, []);

  /**
   * Handle configuring an existing block (right-click context menu)
   */
  const handleConfigureBlock = useCallback((blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.componentType) {
      alert("This component is not configurable.");
      return;
    }
    const component = getComponent(block.componentType);
    if (component) {
      setComponentToConfig(component);
      setBlockIdToEdit(blockId);
    }
  }, [blocks]);

  /**
   * Handle configuration confirmation.
   * Creates a new block or updates an existing one.
   */
  const handleConfigConfirm = useCallback((
    config: Record<string, unknown>,
    generatedPoints?: ConnectionPoint[],
    dimensions?: { width: number; height: number },
    _svgContent?: string,
    blockName?: string,
  ) => {
    if (!componentToConfig) return;

    if (blockIdToEdit) {
      const block = blocks.find(b => b.id === blockIdToEdit);
      if (block) {
        const w = dimensions ? dimensions.width : block.width;
        const h = dimensions ? dimensions.height : block.height;
        const { componentConfig, wiresOnTop } = partitionConfig(config);
        const updatedBlock: Block = {
          ...block,
          componentConfig,
          width: w,
          height: h,
          svgViewBox: `0 0 ${w} ${h}`,
          wiresOnTop: wiresOnTop ?? block.wiresOnTop,
          label: blockName?.trim() ? blockName.trim() : block.label,
        };

        if (generatedPoints) {
          updatedBlock.connectionPoints = generatedPoints;

          const newPointIds = new Set(generatedPoints.map(p => p.id));
          const wiresToRemove = wires.filter(w =>
            (w.fromBlockId === block.id && !newPointIds.has(w.fromPointId!)) ||
            (w.toBlockId === block.id && !newPointIds.has(w.toPointId!))
          );

          if (wiresToRemove.length > 0) {
            const wireIdsToRemove = new Set(wiresToRemove.map(w => w.id));
            setWires(wires.filter(w => !wireIdsToRemove.has(w.id)));
          }
        }

        setBlocks(blocks.map(b => b.id === blockIdToEdit ? updatedBlock : b));
        saveToHistory();
      }
      setBlockIdToEdit(null);
    } else {
      const viewportCenterX = -pan.x + (window.innerWidth / 2) / zoom;
      const viewportCenterY = -pan.y + (window.innerHeight / 2) / zoom;
      const width = dimensions?.width ?? 100;
      const height = dimensions?.height ?? 80;
      const { componentConfig, wiresOnTop } = partitionConfig(config);

      const newBlock: Block = {
        id: `comp_${Date.now()}`,
        x: snapToGrid(viewportCenterX - width / 2, GRID_SIZE),
        y: snapToGrid(viewportCenterY - height / 2, GRID_SIZE),
        width,
        height,
        label: blockName?.trim() ? blockName.trim() : componentToConfig.metadata.name,
        color: '#ffffff',
        shape: 'rectangle',
        connectionPoints: generatedPoints || [],
        svgComponent: 'generated',
        svgViewBox: `0 0 ${width} ${height}`,
        componentConfig,
        componentType: componentToConfig.metadata.id,
        rotation: 0,
        wiresOnTop: wiresOnTop ?? true,
      };

      setBlocks([...blocks, newBlock]);
      saveToHistory();
    }
    setComponentToConfig(null);
  }, [blocks, wires, setBlocks, setWires, saveToHistory, blockIdToEdit, componentToConfig, pan, zoom, GRID_SIZE]);

  const closeConfig = useCallback(() => {
    setComponentToConfig(null);
    setBlockIdToEdit(null);
  }, []);

  const blockForEdit = blockIdToEdit ? blocks.find(b => b.id === blockIdToEdit) : undefined;

  // Build initialConfig for the modal by merging componentConfig with framework-
  // level Block fields (wiresOnTop) so the form sees the actual current values.
  const initialConfigForEdit = blockForEdit
    ? {
        ...(blockForEdit.componentConfig || {}),
        wiresOnTop: blockForEdit.wiresOnTop ?? true,
      }
    : undefined;

  return {
    componentToConfig,
    blockIdToEdit,
    handleComponentSelect,
    handleConfigurableComponent,
    handleConfigureBlock,
    handleConfigConfirm,
    closeConfig,
    getBlockForEdit: blockForEdit,
    initialConfigForEdit,
  };
}
