/**
 * CFG Layout Engine
 *
 * Computes visual layout for control flow graphs using hierarchical (Sugiyama) algorithm.
 * Produces coordinates for blocks and edge routing for visualization.
 */

import { EdgeType } from "./types";
import type {
  ControlFlowGraph,
  CFGLayout,
  BlockLayout,
  EdgeLayout,
  LayoutOptions,
  Point,
  BasicBlock,
} from "./types";

export class CFGLayoutEngine {
  private options: LayoutOptions;

  constructor(options: LayoutOptions) {
    this.options = options;
  }

  /**
   * Compute layout for CFG
   *
   * Uses Sugiyama hierarchical layout algorithm:
   * 1. Layer Assignment - assign blocks to horizontal layers
   * 2. Crossing Reduction - minimize edge crossings
   * 3. Coordinate Assignment - assign final X,Y coordinates
   * 4. Edge Routing - compute edge paths
   */
  computeLayout(cfg: ControlFlowGraph): CFGLayout {
    if (cfg.blocks.size === 0) {
      return {
        blocks: new Map(),
        edges: [],
        bounds: { width: 0, height: 0, minX: 0, minY: 0 },
      };
    }

    // Phase 1: Assign blocks to layers (levels)
    const layers = this.assignLayers(cfg);

    // Phase 2: Order blocks within layers to reduce crossings
    this.reduceCrossings(layers, cfg);

    // Phase 3: Assign coordinates
    const blockLayouts = this.assignCoordinates(layers);

    // Phase 4: Route edges
    const edgeLayouts = this.routeEdges(blockLayouts, cfg);

    // Calculate bounds
    const bounds = this.calculateBounds(blockLayouts);

    return {
      blocks: blockLayouts,
      edges: edgeLayouts,
      bounds,
    };
  }

  /**
   * Phase 1: Assign blocks to layers using longest-path layering
   *
   * Each block is assigned to a layer (vertical level) based on
   * the longest path from the entry block.
   */
  private assignLayers(cfg: ControlFlowGraph): Map<number, string[]> {
    const layers = new Map<number, string[]>();
    const levels = new Map<string, number>();

    // BFS to assign levels
    const queue: Array<{ id: string; level: number }> = [
      { id: cfg.entryBlock, level: 0 },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;

      if (visited.has(id)) {
        // Update level if we found a longer path
        const currentLevel = levels.get(id) ?? -1;
        if (level > currentLevel) {
          levels.set(id, level);
        }
        continue;
      }

      visited.add(id);
      levels.set(id, level);

      const block = cfg.blocks.get(id);
      if (!block) continue;

      // Add successors to queue
      for (const successorId of block.successors) {
        queue.push({ id: successorId, level: level + 1 });
      }
    }

    // Group blocks by level
    for (const [id, level] of levels) {
      if (!layers.has(level)) {
        layers.set(level, []);
      }
      layers.get(level)!.push(id);
    }

    return layers;
  }

  /**
   * Phase 2: Reduce edge crossings using barycentric heuristic
   *
   * Reorder blocks within each layer to minimize edge crossings.
   * Uses iterative improvement with barycentric positioning.
   */
  private reduceCrossings(
    layers: Map<number, string[]>,
    cfg: ControlFlowGraph,
  ): void {
    const maxIterations = 10;

    for (let iter = 0; iter < maxIterations; iter++) {
      let improved = false;

      // Forward pass - adjust based on predecessors
      const sortedLevels = Array.from(layers.keys()).sort((a, b) => a - b);

      for (const level of sortedLevels) {
        const layer = layers.get(level)!;
        if (layer.length <= 1) continue;

        // Calculate barycenter for each block
        const barycenters = new Map<string, number>();

        for (const blockId of layer) {
          const block = cfg.blocks.get(blockId);
          if (!block || block.predecessors.length === 0) {
            barycenters.set(blockId, layer.indexOf(blockId));
            continue;
          }

          // Average position of predecessors
          let sum = 0;
          let count = 0;

          for (const predId of block.predecessors) {
            const predLevel = this.getBlockLevel(predId, layers);
            if (predLevel !== undefined && predLevel < level) {
              const predLayer = layers.get(predLevel)!;
              sum += predLayer.indexOf(predId);
              count++;
            }
          }

          barycenters.set(
            blockId,
            count > 0 ? sum / count : layer.indexOf(blockId),
          );
        }

        // Sort layer by barycenter
        const newOrder = [...layer].sort((a, b) => {
          return (barycenters.get(a) ?? 0) - (barycenters.get(b) ?? 0);
        });

        // Check if order changed
        if (newOrder.some((id, i) => id !== layer[i])) {
          layers.set(level, newOrder);
          improved = true;
        }
      }

      if (!improved) break;
    }
  }

  /**
   * Get the level of a block
   */
  private getBlockLevel(
    blockId: string,
    layers: Map<number, string[]>,
  ): number | undefined {
    for (const [level, layer] of layers) {
      if (layer.includes(blockId)) {
        return level;
      }
    }
    return undefined;
  }

  /**
   * Phase 3: Assign X,Y coordinates to blocks
   */
  private assignCoordinates(
    layers: Map<number, string[]>,
  ): Map<string, BlockLayout> {
    const layouts = new Map<string, BlockLayout>();
    const { blockWidth, blockHeight, horizontalSpacing, verticalSpacing } =
      this.options;

    const sortedLevels = Array.from(layers.keys()).sort((a, b) => a - b);

    for (const level of sortedLevels) {
      const layer = layers.get(level)!;
      const y = level * (blockHeight + verticalSpacing);

      // Center blocks horizontally
      const totalWidth =
        layer.length * blockWidth + (layer.length - 1) * horizontalSpacing;
      let startX = 0;

      if (this.options.compactLayout) {
        startX = 0;
      } else {
        // Center the layer
        startX = Math.max(0, -totalWidth / 2);
      }

      for (let i = 0; i < layer.length; i++) {
        const blockId = layer[i];
        const x = startX + i * (blockWidth + horizontalSpacing);

        layouts.set(blockId, {
          id: blockId,
          x,
          y,
          width: blockWidth,
          height: blockHeight,
          level,
        });
      }
    }

    return layouts;
  }

  /**
   * Phase 4: Route edges between blocks
   *
   * Creates edge paths with bezier curves for smooth visualization.
   */
  private routeEdges(
    blockLayouts: Map<string, BlockLayout>,
    cfg: ControlFlowGraph,
  ): EdgeLayout[] {
    const edges: EdgeLayout[] = [];

    for (const [blockId, block] of cfg.blocks) {
      const fromLayout = blockLayouts.get(blockId);
      if (!fromLayout) continue;

      for (const edge of block.edges) {
        const toLayout = blockLayouts.get(edge.target);
        if (!toLayout) continue;

        const edgeLayout = this.createEdgeLayout(
          fromLayout,
          toLayout,
          edge.type,
          block,
          cfg,
        );

        edges.push(edgeLayout);
      }
    }

    return edges;
  }

  /**
   * Create edge layout with routing points
   */
  private createEdgeLayout(
    from: BlockLayout,
    to: BlockLayout,
    type: EdgeType,
    _fromBlock: BasicBlock,
    _cfg: ControlFlowGraph,
  ): EdgeLayout {
    // Calculate edge color
    const color = this.getEdgeColor(type);

    // Calculate connection points
    const fromPoint = this.getBlockExitPoint(from);
    const toPoint = this.getBlockEntryPoint(to);

    // Check if this is a back-edge (loop)
    const isBackEdge = to.level <= from.level;

    // Generate bezier control points
    const points = this.generateEdgePath(
      fromPoint,
      toPoint,
      isBackEdge,
      from,
      to,
    );

    return {
      from: from.id,
      to: to.id,
      type,
      points,
      color,
      isBackEdge,
    };
  }

  /**
   * Get block exit point (bottom center)
   */
  private getBlockExitPoint(layout: BlockLayout): Point {
    return {
      x: layout.x + layout.width / 2,
      y: layout.y + layout.height,
    };
  }

  /**
   * Get block entry point (top center)
   */
  private getBlockEntryPoint(layout: BlockLayout): Point {
    return {
      x: layout.x + layout.width / 2,
      y: layout.y,
    };
  }

  /**
   * Generate edge path with bezier control points
   */
  private generateEdgePath(
    from: Point,
    to: Point,
    isBackEdge: boolean,
    fromLayout: BlockLayout,
    toLayout: BlockLayout,
  ): Point[] {
    if (isBackEdge) {
      // Back-edges curve around to the side
      const side = fromLayout.x < toLayout.x ? -1 : 1;
      const offset = 50 * side;

      return [
        from,
        { x: from.x + offset, y: from.y + 30 },
        { x: to.x + offset, y: to.y - 30 },
        to,
      ];
    }

    // Normal forward edge
    const dy = to.y - from.y;

    if (Math.abs(from.x - to.x) < 10) {
      // Straight vertical line
      return [from, to];
    }

    // Curved edge
    const controlOffset = Math.min(dy * 0.5, 50);

    return [
      from,
      { x: from.x, y: from.y + controlOffset },
      { x: to.x, y: to.y - controlOffset },
      to,
    ];
  }

  /**
   * Get edge color based on type
   */
  private getEdgeColor(type: EdgeType): string {
    const colors = {
      [EdgeType.UNCONDITIONAL]: "#9ca3af", // Gray
      [EdgeType.CONDITIONAL_TRUE]: "#10b981", // Green
      [EdgeType.CONDITIONAL_FALSE]: "#ef4444", // Red
      [EdgeType.CALL]: "#a855f7", // Purple
      [EdgeType.RETURN]: "#ec4899", // Pink
    };

    return colors[type] || "#9ca3af";
  }

  /**
   * Calculate bounding box for layout
   */
  private calculateBounds(blockLayouts: Map<string, BlockLayout>): {
    width: number;
    height: number;
    minX: number;
    minY: number;
  } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [, layout] of blockLayouts) {
      minX = Math.min(minX, layout.x);
      minY = Math.min(minY, layout.y);
      maxX = Math.max(maxX, layout.x + layout.width);
      maxY = Math.max(maxY, layout.y + layout.height);
    }

    const padding = 50;

    return {
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
      minX,
      minY,
    };
  }
}
