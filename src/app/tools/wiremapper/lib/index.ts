/**
 * Wire Mapper Utility Functions and Shared Logic
 */

import { nanoid } from 'nanoid';
import { Connector, WireMapperProject } from '../types';

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
  gender: 'male' | 'female'
): Omit<Connector, 'id'> => {
  // Generate default pins
  const pins = Array.from({ length: rows * cols }).map((_, i) => ({
    pos: i + 1,
    name: `Pin ${i + 1}`,
    color: '#cccccc',
  }));

  // Create connector template
  return {
    name,
    type,
    rows,
    cols,
    gender,
    pins,
    position: {
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      rotation: 0
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
