/**
 * Demo data generator for uCAN Monitor
 * Generates realistic CAN message data for demonstration purposes
 */

import { CANMessage } from "../types";

/**
 * Generate demo CAN messages for display when not connected
 */
export function generateDemoMessages(): CANMessage[] {
  const messages: CANMessage[] = [];
  const now = Date.now();

  // Simulate common automotive CAN messages
  const demoPatterns = [
    {
      canId: 0x100,
      data: [0x00, 0x00, 0x07, 0x50, 0x00, 0x3d, 0x3a, 0x26],
      description: "Engine RPM",
    },
    {
      canId: 0x200,
      data: [0x07, 0x45, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff],
      description: "Vehicle Speed",
    },
    {
      canId: 0x300,
      data: [0x1a, 0x92, 0x1c, 0x00],
      description: "Throttle Position",
    },
    {
      canId: 0x110,
      data: [0xff, 0x00, 0x55, 0xaa],
      description: "Coolant Temp",
    },
    {
      canId: 0x220,
      data: [0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0],
      description: "Transmission",
    },
  ];

  // Generate 30 messages with realistic timing (100ms intervals)
  for (let i = 0; i < 30; i++) {
    const pattern = demoPatterns[i % demoPatterns.length];

    // Add some variance to the data
    const data = new Uint8Array(pattern.data);
    if (i % 5 === 0) {
      data[data.length - 1] = (data[data.length - 1] + i) % 256;
    }

    messages.push({
      id: `demo-${i}`,
      timestamp: new Date(now - (30 - i) * 100),
      direction: "RX",
      type: "CAN_RX",
      canId: pattern.canId,
      data: data,
      length: data.length,
      isExtended: false,
    });
  }

  return messages;
}
