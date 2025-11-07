/**
 * Wire Mapper Utility Functions and Shared Logic
 */

import { nanoid } from 'nanoid';
import { ConnectorShape, Connector, WireMapperProject } from '../types';

/**
 * Generate a unique ID for connectors or mappings
 */
export const generateId = (): string => nanoid(8);

/**
 * Create a basic template for a connector based on rows and columns
 */
export const createConnectorTemplate = (
  name: string,
  type: string,
  rows: number,
  cols: number,
  gender: 'Male' | 'Female' | 'Unknown'
): Omit<Connector, 'id'> => {
  // Generate default pins
  const pins = Array.from({ length: rows * cols }).map((_, i) => ({
    id: `pin-${i}`,
    index: i,
    pos: i + 1,
    name: `Pin ${i + 1}`,
    x: 0,
    y: 0,
    connectedWireIds: [],
    active: true,
    config: {
      color: '#cccccc',
      type: 'signal' as 'power' | 'ground' | 'signal' | 'data' | 'nc'
    },
    visible: true
  }));

  // Create connector template
  return {
    name,
    type,
    shape: 'Rectangle' as ConnectorShape, // Default shape
    rows,
    cols,
    gender,
    pins,
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
    width: 150, // Default width
    height: 100, // Default height
    config: { // Default ConnectorConfig
      rows: rows,
      columns: cols,
      numPins: rows * cols
    }
  };
};

/**
 * Export a project to a downloadable JSON file
 */
export const exportProject = (project: WireMapperProject) => {
  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.projectName.replace(/\s+/g, '_')}_wiremapper.json`;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
