import { useState, useCallback, useReducer } from 'react';

type TransformState = {
  zoom: number;
  pan: { x: number; y: number };
};

type TransformAction =
  | { type: 'SET_ZOOM_AND_PAN'; zoom: number; pan: { x: number; y: number } }
  | { type: 'SET_PAN'; pan: { x: number; y: number } };

function transformReducer(state: TransformState, action: TransformAction): TransformState {
  switch (action.type) {
    case 'SET_ZOOM_AND_PAN':
      return { zoom: action.zoom, pan: action.pan };
    case 'SET_PAN':
      return { ...state, pan: action.pan };
    default:
      return state;
  }
}

/**
 * Custom hook for managing canvas zoom and pan transformations
 *
 * Provides:
 * - Mouse wheel zoom towards cursor position
 * - Middle mouse button panning
 * - Constrained zoom levels (0.1x to 5x)
 *
 * @param svgRef - Reference to the SVG element for coordinate transformations
 * @returns State and handler functions for canvas transformation
 */
export const useCanvasTransform = (svgRef: React.RefObject<SVGSVGElement>) => {
  // Zoom constraints
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;
  const ZOOM_SPEED = 0.001;

  // Zoom and pan state - use reducer for atomic updates
  const [{ zoom, pan }, dispatch] = useReducer(transformReducer, {
    zoom: 1,
    pan: { x: 0, y: 0 }
  });

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  /**
   * Start panning with middle mouse button
   */
  const startPanning = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    setPanStart({ x: clientX, y: clientY });
  }, []);

  /**
   * Update pan position during drag
   */
  const updatePan = useCallback((clientX: number, clientY: number) => {
    setPanStart((prevPanStart) => {
      const dx = (clientX - prevPanStart.x) / zoom;
      const dy = (clientY - prevPanStart.y) / zoom;

      dispatch({
        type: 'SET_PAN',
        pan: { x: pan.x + dx, y: pan.y + dy }
      });

      return { x: clientX, y: clientY };
    });
  }, [zoom, pan]);

  /**
   * Stop panning
   */
  const stopPanning = useCallback(() => {
    setIsPanning(false);
  }, []);

  /**
   * Handle mouse wheel zoom with zoom towards cursor position
   * Zooms toward the point in SVG space that is currently under the mouse cursor
   * Skips zoom if event originated from inside a modal/overlay
   */
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!svgRef.current) return;

    // Check if the event target is inside a modal/overlay (position: fixed elements)
    // This allows scrolling inside modals while still zooming on the canvas
    const target = e.target as HTMLElement;
    let element: HTMLElement | null = target;
    while (element) {
      const style = window.getComputedStyle(element);
      if (style.position === 'fixed') {
        // Event is inside a fixed-position overlay (modal), don't handle zoom
        return;
      }
      element = element.parentElement;
    }

    e.preventDefault();

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    // Get mouse position relative to SVG element
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(MIN_ZOOM, zoom * zoomFactor), MAX_ZOOM);

    // Calculate world point under cursor BEFORE zoom
    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    // Calculate new pan to keep that world point under cursor AFTER zoom
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;

    // Atomically update both zoom and pan in one action
    dispatch({
      type: 'SET_ZOOM_AND_PAN',
      zoom: newZoom,
      pan: { x: newPanX, y: newPanY }
    });
  }, [svgRef, zoom, pan, MIN_ZOOM, MAX_ZOOM]);

  return {
    // State
    zoom,
    pan,
    isPanning,
    panStart,

    // Functions
    startPanning,
    updatePan,
    stopPanning,
    handleWheel,

    // Constants
    MIN_ZOOM,
    MAX_ZOOM,
    ZOOM_SPEED
  };
};
