'use client';

import { Pin, ConnectorConfig, ConnectorShape, DynamicConfigSchema } from '../types';
import { IConnectorRenderer } from './base/IConnectorRenderer';
import { generateUniqueId } from '../utils/generateUniqueId';

export class CircleRenderer implements IConnectorRenderer {
  shape: ConnectorShape = 'Circle';
  static displayName = 'Circle';

  getConfigurationSchema(): DynamicConfigSchema {
    return {
      numPins: {
        key: 'numPins',
        label: 'Number of Pins',
        type: 'number',
        defaultValue: 8,
        min: 1,
        max: 100,
        required: true,
      },
      pinNumberingStart: {
        key: 'pinNumberingStart',
        label: 'Pin 1 Position',
        type: 'radio',
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Right', value: 'right' },
          { label: 'Bottom', value: 'bottom' },
          { label: 'Left', value: 'left' },
        ],
        defaultValue: 'top',
      },
    };
  }

  getPinPosition(
    pinIndex: number,
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
  ): { x: number; y: number } | null {
    const { numPins = 1, pinNumberingStart = 'top' } = config;
    if (pinIndex >= numPins || pinIndex < 0) {
      return null;
    }
    if (dimensions.width <= 0 || dimensions.height <= 0) {
        return null;
    }
    const radius = Math.min(dimensions.width, dimensions.height) / 2.5;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    if (numPins <= 0) return null;
    const angleIncrement = (2 * Math.PI) / numPins;
    let startAngle = -Math.PI / 2;
    switch (pinNumberingStart) {
        case 'right': startAngle = 0; break;
        case 'bottom': startAngle = Math.PI / 2; break;
        case 'left': startAngle = Math.PI; break;
    }
    const angle = startAngle + pinIndex * angleIncrement;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
     if (isNaN(x) || isNaN(y)) {
        console.error(`NaN calculated for pin ${pinIndex}: Angle=${angle}, Center=(${centerX}, ${centerY}), Radius=${radius}`);
        return null;
    }
    return { x, y };
  }

  generatePins(
    config: ConnectorConfig,
    dimensions: { width: number; height: number },
  ): Pin[] {
    const { numPins = 1 } = config;
    const pins: Pin[] = [];
    if (dimensions.width <= 0 || dimensions.height <= 0) {
        console.warn('Cannot generate pins with invalid dimensions:', dimensions);
        return [];
    }
    for (let i = 0; i < numPins; i++) {
      const position = this.getPinPosition(i, config, dimensions);
      if (position) {
        pins.push({
          id: generateUniqueId(),
          index: i,
          pos: i + 1, // Add the required 'pos' property
          name: `Pin ${i + 1}`,
          number: i + 1,
          x: position.x,
          y: position.y,
          config: {},
          connectedWireIds: [],
          active: true,
          visible: true,
        });
      } else {
          console.warn(`Could not generate position for pin index ${i} with config:`, config);
      }
    }
    return pins;
  }
}
