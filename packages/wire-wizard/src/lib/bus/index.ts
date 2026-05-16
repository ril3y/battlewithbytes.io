/**
 * Bus Wire Utilities
 * Exports for bus-related calculations and helpers
 */

export {
  calculateBusCenterPath,
  getBusWiresByGroupId,
  wiresHaveMatchingEndpoints,
  calculateBusPathLength,
  projectPointOntoPath,
  type Point,
  type WireAnalysis,
  type BusCenterPath,
  type GetEndpointFn
} from './busUtils';

export {
  useBusOperations,
  type UseBusOperationsDeps,
  type UseBusOperationsReturn,
  type BusGroup,
  type BusGroups
} from './hooks';
