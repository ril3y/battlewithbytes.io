/**
 * CPU Detection from Binary Files
 *
 * Analyzes binary file information to auto-detect CPU/MCU
 */

import { BinaryInfo, Architecture } from '../binary/types';
import { CpuDefinition } from './CpuDefinition';
import { getCpuDefinitionManager } from './CpuDefinitionManager';

export interface CpuDetectionResult {
  cpuId: string | null;
  confidence: 'high' | 'medium' | 'low';
  matchedBy: string;
  suggestions?: string[];
}

/**
 * Detect CPU from binary file information
 */
export function detectCpuFromBinary(binaryInfo: BinaryInfo): CpuDetectionResult {
  const manager = getCpuDefinitionManager();
  const allDefinitions = manager.getAllDefinitions();

  // Extract key info from binary
  const arch = binaryInfo.architecture;
  const entryPoint = binaryInfo.entryPoint;
  const flashStart = binaryInfo.sections?.find(s => s.name.toLowerCase().includes('text'))?.address;
  const ramStart = binaryInfo.sections?.find(s => s.name.toLowerCase().includes('data'))?.address;

  // Score each CPU definition
  const scores: Array<{ cpu: CpuDefinition; score: number; reasons: string[] }> = [];

  for (const cpu of allDefinitions) {
    let score = 0;
    const reasons: string[] = [];

    // Architecture match (most important)
    if (matchesArchitecture(arch, cpu.architecture)) {
      score += 50;
      reasons.push(`Architecture: ${arch}`);
    }

    // Entry point in flash region
    if (entryPoint && cpu.memoryRegions) {
      for (const region of cpu.memoryRegions) {
        if (region.type === 'flash' && entryPoint >= region.start && entryPoint <= region.end) {
          score += 20;
          reasons.push(`Entry point in flash region`);
          break;
        }
      }
    }

    // Flash start address match
    if (flashStart && cpu.memoryRegions) {
      for (const region of cpu.memoryRegions) {
        if (region.type === 'flash' && flashStart === region.start) {
          score += 15;
          reasons.push(`Flash address matches`);
          break;
        }
      }
    }

    // RAM start address match
    if (ramStart && cpu.memoryRegions) {
      for (const region of cpu.memoryRegions) {
        if ((region.type === 'ram' || region.type === 'sram') && ramStart === region.start) {
          score += 10;
          reasons.push(`RAM address matches`);
          break;
        }
      }
    }

    // Flash size match (within 10% tolerance)
    if (binaryInfo.flashSize && cpu.flashSize) {
      const tolerance = cpu.flashSize * 0.1;
      if (Math.abs(binaryInfo.flashSize - cpu.flashSize) <= tolerance) {
        score += 5;
        reasons.push(`Flash size similar`);
      }
    }

    if (score > 0) {
      scores.push({ cpu, score, reasons });
    }
  }

  // Sort by score
  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    // No matches - suggest generic based on architecture
    const genericId = getGenericCpuForArchitecture(arch);
    return {
      cpuId: genericId,
      confidence: 'low',
      matchedBy: 'Generic fallback',
      suggestions: []
    };
  }

  const best = scores[0];
  const suggestions = scores.slice(1, 4).map(s => s.cpu.id);

  // Determine confidence based on score
  let confidence: 'high' | 'medium' | 'low';
  if (best.score >= 70) {
    confidence = 'high';
  } else if (best.score >= 40) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    cpuId: best.cpu.id,
    confidence,
    matchedBy: best.reasons.join(', '),
    suggestions
  };
}

/**
 * Check if architecture strings match
 */
function matchesArchitecture(binaryArch: Architecture, cpuArch: string): boolean {
  const normalize = (arch: string) => arch.toLowerCase().replace(/[-_\s]/g, '');

  const binArch = normalize(binaryArch);
  const defArch = normalize(cpuArch);

  // Direct match
  if (binArch === defArch) return true;

  // ARM Cortex-M variants
  if (binArch.includes('armv7m') && defArch.includes('cortexm4')) return true;
  if (binArch.includes('armv7em') && defArch.includes('cortexm4')) return true;
  if (binArch.includes('cortexm4') && defArch.includes('armv7')) return true;

  // Broader ARM match
  if (binArch.includes('arm') && defArch.includes('arm')) return true;

  return false;
}

/**
 * Get generic CPU definition for architecture
 */
function getGenericCpuForArchitecture(arch: Architecture): string {
  const archLower = arch.toLowerCase();

  if (archLower.includes('cortexm4') || archLower.includes('armv7')) {
    return 'generic-cortex-m4';
  }

  // Default to generic Cortex-M4
  return 'generic-cortex-m4';
}

/**
 * Detect CPU from target name (from GDB/SWD scan)
 *
 * @param targetName - Target name from debug probe (e.g., "nRF52 M4", "STM32F407")
 * @returns CPU definition ID or null if not detected
 */
export function detectCpuFromTargetName(targetName: string): string | null {
  const nameLower = targetName.toLowerCase();

  // nRF52 family detection
  if (nameLower.includes('nrf52')) {
    // Could be nRF52832, nRF52840, etc.
    // For now, default to nRF52832 (most common)
    // TODO: Detect specific variant
    return 'nrf52832';
  }

  // STM32 family detection
  if (nameLower.includes('stm32f407') || nameLower.includes('stm32f4')) {
    return 'stm32f407';
  }

  // MT7697 detection
  if (nameLower.includes('mt7697')) {
    return 'mt7697';
  }

  // Generic Cortex-M4 fallback
  if (nameLower.includes('cortex-m4') || nameLower.includes('cortexm4') || nameLower.includes('m4')) {
    return 'generic-cortex-m4';
  }

  return null;
}

/**
 * Create custom CPU definition from binary sections
 */
export function createCpuFromBinary(binaryInfo: BinaryInfo, cpuName: string): Omit<CpuDefinition, 'id'> {
  const memoryRegions: CpuDefinition['memoryRegions'] = [];

  // Extract memory regions from sections
  if (binaryInfo.sections) {
    for (const section of binaryInfo.sections) {
      const name = section.name;
      const start = section.address;
      const size = section.size;
      const end = start + size - 1;

      let type: 'flash' | 'sram' | 'ram' | 'peripheral' | 'system' | 'external_ram' | 'external_device' | 'reserved';
      let permissions = { read: true, write: false, execute: false };

      // Determine type and permissions from section name
      if (name.includes('.text') || name.includes('CODE')) {
        type = 'flash';
        permissions = { read: true, write: false, execute: true };
      } else if (name.includes('.data') || name.includes('.bss') || name.includes('RAM')) {
        type = 'sram';
        permissions = { read: true, write: true, execute: false };
      } else if (name.includes('.rodata') || name.includes('FLASH')) {
        type = 'flash';
        permissions = { read: true, write: false, execute: false };
      } else {
        type = 'reserved';
        permissions = { read: true, write: false, execute: false };
      }

      memoryRegions.push({
        name: section.name,
        type,
        start,
        end,
        size,
        permissions,
        description: `Binary section: ${name}`
      });
    }
  }

  return {
    name: cpuName,
    family: binaryInfo.architecture,
    vendor: 'Custom',
    architecture: binaryInfo.architecture,
    flashSize: binaryInfo.flashSize,
    ramSize: binaryInfo.ramSize,
    memoryRegions
  };
}
