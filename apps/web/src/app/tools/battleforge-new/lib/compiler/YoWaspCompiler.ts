/**
 * YoWasp Compiler Wrapper
 *
 * Provides a unified interface for YoWasp-based compilers from npm packages.
 * YoWasp compilers are WebAssembly builds of popular EDA tools that can
 * run in the browser or Node.js.
 */

export interface YoWaspCompilerOptions {
  args: string[];
  files?: Record<string, Uint8Array | string>;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

export interface YoWaspCompilerResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  files?: Map<string, Uint8Array>;
}

export type YoWaspPackage = 'yosys' | 'nextpnr-ice40' | 'icestorm';

/**
 * YoWasp Compiler Wrapper
 *
 * Dynamically loads YoWasp npm packages and executes them with
 * the virtual filesystem.
 */
export class YoWaspCompiler {
  private packageName: YoWaspPackage;
  private isLoaded = false;
  private wasmModule: unknown = null;

  constructor(packageName: YoWaspPackage) {
    this.packageName = packageName;
  }

  /**
   * Load the YoWasp package from npm
   */
  async load(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    try {
      // Dynamically import the YoWasp package
      const module = await import(`@yowasp/${this.packageName}`);
      this.wasmModule = module;
      this.isLoaded = true;
    } catch (error) {
      throw new Error(
        `Failed to load @yowasp/${this.packageName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute the YoWasp compiler with given arguments
   */
  async execute(options: YoWaspCompilerOptions): Promise<YoWaspCompilerResult> {
    if (!this.isLoaded || !this.wasmModule) {
      throw new Error('YoWasp module not loaded. Call load() first.');
    }

    // YoWasp packages provide a run() function
    const module = this.wasmModule as {
      run: (args: string[], files: Record<string, Uint8Array | string>) => Promise<{
        code: number;
        stdout: string;
        stderr: string;
        files: Record<string, Uint8Array>;
      }>;
    };

    // Prepare files
    const files: Record<string, Uint8Array | string> = {};
    if (options.files) {
      for (const [path, content] of Object.entries(options.files)) {
        files[path] = content;
      }
    }

    // Execute
    const result = await module.run(options.args, files);

    // Stream output if callbacks provided
    if (options.onStdout && result.stdout) {
      options.onStdout(result.stdout);
    }
    if (options.onStderr && result.stderr) {
      options.onStderr(result.stderr);
    }

    // Convert files to Map
    const outputFiles = new Map<string, Uint8Array>();
    for (const [path, content] of Object.entries(result.files)) {
      if (content instanceof Uint8Array) {
        outputFiles.set(path, content);
      }
    }

    return {
      success: result.code === 0,
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      files: outputFiles
    };
  }

  /**
   * Get compiler version
   */
  async getVersion(): Promise<string> {
    try {
      const result = await this.execute({
        args: ['--version']
      });
      return result.stdout.trim() || `YoWasp ${this.packageName}`;
    } catch (error) {
      console.error('[YoWaspCompiler] Failed to get version:', error);
      return 'Unknown version';
    }
  }

  /**
   * Check if compiler is ready
   */
  isReady(): boolean {
    return this.isLoaded;
  }
}

/**
 * Create a YoWasp compiler instance
 */
export function createYoWaspCompiler(packageName: YoWaspPackage): YoWaspCompiler {
  return new YoWaspCompiler(packageName);
}
