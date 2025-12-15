/**
 * Analysis State Manager
 *
 * Handles detection and management of firmware analysis state.
 * Determines if analysis exists, is current, or outdated based on:
 * - Project metadata (analysis timestamps, firmware hash)
 * - IndexedDB database existence
 * - Firmware hash comparison
 */

import { BattleMagicProject, AnalysisMetadata } from '../project/types';
import { AnalysisDatabase } from '../db/AnalysisDatabase';

/**
 * Analysis state enum
 */
export type AnalysisState = 'none' | 'outdated' | 'current';

/**
 * Analysis state details
 */
export interface AnalysisStateDetails {
  state: AnalysisState;
  hasProject: boolean;
  hasMetadata: boolean;
  hasMdbData: boolean;
  firmwareChanged: boolean;
  metadata?: AnalysisMetadata;
  statusMessage: string;
  lastAnalyzedDate?: Date;
}

/**
 * AnalysisStateManager - Core logic for MDB integration
 */
export class AnalysisStateManager {
  /**
   * Check comprehensive analysis state for current firmware
   */
  async checkAnalysisState(
    project: BattleMagicProject,
    analysisDb: AnalysisDatabase
  ): Promise<AnalysisStateDetails> {
    // Check 1: Does project have analysis metadata?
    const hasMetadata = !!project.analysis;

    // Check 2: Does IndexedDB have any analysis data?
    const hasMdbData = await analysisDb.hasAnalysis();

    // Check 3: Does firmware exist in project?
    const hasFirmware = !!project.firmware;

    // Check 4: Has firmware changed since analysis?
    const firmwareChanged = this.isFirmwareChanged(project);

    // Determine state based on checks
    let state: AnalysisState = 'none';
    let statusMessage = 'No analysis available';

    if (hasMetadata && hasMdbData) {
      if (firmwareChanged) {
        state = 'outdated';
        statusMessage = 'Firmware changed - analysis outdated';
      } else {
        state = 'current';
        const analyzedDate = project.analysis?.analyzedAt
          ? new Date(project.analysis.analyzedAt)
          : null;

        if (analyzedDate) {
          const timeAgo = this.getTimeAgoString(analyzedDate);
          statusMessage = `Analyzed ${timeAgo}`;
        } else {
          statusMessage = 'Analysis available';
        }
      }
    } else if (hasMetadata && !hasMdbData) {
      state = 'outdated';
      statusMessage = 'Analysis metadata exists but MDB missing';
    } else if (!hasMetadata && hasMdbData) {
      // Orphaned MDB data (shouldn't happen, but handle it)
      state = 'current';
      statusMessage = 'Analysis data found (no metadata)';
    } else {
      // No metadata, no MDB data
      state = 'none';
      if (hasFirmware) {
        statusMessage = 'Firmware ready for analysis';
      } else {
        statusMessage = 'No firmware or analysis';
      }
    }

    return {
      state,
      hasProject: !!project,
      hasMetadata,
      hasMdbData,
      firmwareChanged,
      metadata: project.analysis,
      statusMessage,
      lastAnalyzedDate: project.analysis?.analyzedAt
        ? new Date(project.analysis.analyzedAt)
        : undefined,
    };
  }

  /**
   * Check if firmware has changed since last analysis
   */
  private isFirmwareChanged(project: BattleMagicProject): boolean {
    if (!project.analysis || !project.firmware) {
      return false;
    }

    // Compare firmware hash at analysis time vs current firmware hash
    const analysisHash = project.analysis.firmwareHashAtAnalysis;
    const currentHash = project.firmware.hash;

    if (!analysisHash || !currentHash) {
      return false;
    }

    return analysisHash !== currentHash;
  }

  /**
   * Get human-readable analysis status message
   */
  getAnalysisStatusMessage(project: BattleMagicProject): string {
    if (!project.analysis) {
      return 'No analysis available';
    }

    // Check if firmware changed
    if (this.isFirmwareChanged(project)) {
      return 'Firmware changed since last analysis';
    }

    // Get time since analysis
    if (project.analysis.analyzedAt) {
      const analyzedDate = new Date(project.analysis.analyzedAt);
      const timeAgo = this.getTimeAgoString(analyzedDate);
      return `Last analyzed ${timeAgo}`;
    }

    return 'Analysis available';
  }

  /**
   * Get human-readable time ago string
   */
  private getTimeAgoString(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  }

  /**
   * Get detailed statistics from analysis metadata
   */
  getAnalysisStats(project: BattleMagicProject): string[] {
    if (!project.analysis?.stats) {
      return [];
    }

    const stats = project.analysis.stats;
    return [
      `${stats.totalInstructions.toLocaleString()} instructions`,
      `${stats.functionCount.toLocaleString()} functions`,
      `${stats.xrefCount.toLocaleString()} cross-references`,
      `Analysis time: ${stats.analysisTimeMs}ms`,
    ];
  }

  /**
   * Check if analysis should be auto-loaded on startup
   * Returns true if analysis is recent (< 24 hours old)
   */
  shouldAutoLoad(project: BattleMagicProject): boolean {
    if (!project.analysis?.analyzedAt) {
      return false;
    }

    // Check if firmware changed
    if (this.isFirmwareChanged(project)) {
      return false;
    }

    // Check if analysis is recent (< 24 hours)
    const analyzedDate = new Date(project.analysis.analyzedAt);
    const hoursSinceAnalysis = (Date.now() - analyzedDate.getTime()) / (1000 * 60 * 60);

    return hoursSinceAnalysis < 24;
  }
}
