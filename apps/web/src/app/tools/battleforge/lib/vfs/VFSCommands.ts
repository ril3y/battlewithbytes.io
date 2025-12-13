/**
 * Unix-like command executor for Virtual File System
 * Provides debugging and inspection capabilities for the VFS
 */

import { VirtualFileSystem } from '../wasi/wasiBindings';

export interface CommandResult {
  output: string;
  exitCode: number;
}

export class VFSCommands {
  private fs: VirtualFileSystem;
  private currentDir: string = '/';

  constructor(fs: VirtualFileSystem) {
    this.fs = fs;
  }

  /**
   * Execute a command string (e.g., "ls -la", "cat /main.c")
   */
  execute(commandLine: string): CommandResult {
    const parts = this.parseCommand(commandLine);
    if (parts.length === 0) {
      return { output: '', exitCode: 0 };
    }

    const [command, ...args] = parts;

    try {
      switch (command) {
        case 'ls':
          return this.ls(args);
        case 'cat':
          return this.cat(args);
        case 'pwd':
          return this.pwd();
        case 'cd':
          return this.cd(args);
        case 'mkdir':
          return this.mkdir(args);
        case 'rm':
          return this.rm(args);
        case 'echo':
          return this.echo(args);
        case 'hexdump':
        case 'xxd':
          return this.hexdump(args);
        case 'stat':
          return this.stat(args);
        case 'find':
          return this.find(args);
        case 'help':
          return this.help();
        case 'clear':
          return { output: '\x1b[2J\x1b[H', exitCode: 0 };
        default:
          return { output: `bash: ${command}: command not found\n`, exitCode: 127 };
      }
    } catch (error) {
      return {
        output: `Error: ${error instanceof Error ? error.message : String(error)}\n`,
        exitCode: 1
      };
    }
  }

  private parseCommand(commandLine: string): string[] {
    // Simple parsing - split by spaces, handle quotes later if needed
    return commandLine.trim().split(/\s+/).filter(s => s.length > 0);
  }

  private resolvePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }
    // Relative path - resolve against current directory
    const base = this.currentDir.endsWith('/') ? this.currentDir : this.currentDir + '/';
    const resolved = base + path;
    // Normalize (remove .., ., etc.)
    return this.normalizePath(resolved);
  }

  private normalizePath(path: string): string {
    const parts = path.split('/').filter(p => p.length > 0 && p !== '.');
    const stack: string[] = [];

    for (const part of parts) {
      if (part === '..') {
        stack.pop();
      } else {
        stack.push(part);
      }
    }

    return '/' + stack.join('/');
  }

  private ls(args: string[]): CommandResult {
    let showHidden = false;
    let longFormat = false;
    let humanReadable = false;
    let paths: string[] = [];

    // Parse flags
    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('a')) showHidden = true;
        if (arg.includes('l')) longFormat = true;
        if (arg.includes('h')) humanReadable = true;
      } else {
        paths.push(arg);
      }
    }

    if (paths.length === 0) {
      paths.push(this.currentDir);
    }

    let output = '';

    for (const pathArg of paths) {
      const path = this.resolvePath(pathArg);
      const allFiles = this.fs.listFiles();

      // List files in the directory
      const filesInDir: string[] = [];

      if (path === '/') {
        // Root directory - show top-level entries
        const topLevel = new Set<string>();
        for (const file of allFiles) {
          if (file === '/') continue;
          const parts = file.substring(1).split('/');
          if (parts.length > 0 && parts[0]) {
            topLevel.add(parts[0]);
          }
        }
        filesInDir.push(...Array.from(topLevel).sort());
      } else {
        // Specific directory
        const prefix = path.endsWith('/') ? path : path + '/';
        for (const file of allFiles) {
          if (file.startsWith(prefix)) {
            const relativePath = file.substring(prefix.length);
            const fileName = relativePath.split('/')[0];
            if (fileName && !filesInDir.includes(fileName)) {
              filesInDir.push(fileName);
            }
          }
        }
      }

      if (!showHidden) {
        filesInDir.filter(f => !f.startsWith('.'));
      }

      filesInDir.sort();

      if (longFormat) {
        output += `total ${filesInDir.length}\n`;
        for (const fileName of filesInDir) {
          const fullPath = path === '/' ? '/' + fileName : path + '/' + fileName;
          const isDir = this.fs.exists(fullPath + '/.dir');
          const fileData = this.fs.readFile(fullPath);
          const size = fileData ? fileData.length : 0;
          const sizeStr = humanReadable ? this.formatSize(size) : size.toString();
          const permissions = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
          const type = isDir ? '/' : '';

          output += `${permissions}  1 user  group ${sizeStr.padStart(8)} Jan 1 00:00 ${fileName}${type}\n`;
        }
      } else {
        // Simple format
        for (const fileName of filesInDir) {
          const fullPath = path === '/' ? '/' + fileName : path + '/' + fileName;
          const isDir = this.fs.exists(fullPath + '/.dir');
          output += fileName + (isDir ? '/' : '') + '\n';
        }
      }
    }

    return { output, exitCode: 0 };
  }

  private cat(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'cat: missing file operand\n', exitCode: 1 };
    }

    let output = '';
    for (const arg of args) {
      const path = this.resolvePath(arg);
      const data = this.fs.readFile(path);

      if (!data) {
        output += `cat: ${arg}: No such file or directory\n`;
        continue;
      }

      try {
        // Try to decode as UTF-8 text
        const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
        output += text;
        if (!text.endsWith('\n')) {
          output += '\n';
        }
      } catch {
        // Binary file - show hex representation
        output += `[Binary file - use 'hexdump ${arg}' to view]\n`;
      }
    }

    return { output, exitCode: 0 };
  }

  private pwd(): CommandResult {
    return { output: this.currentDir + '\n', exitCode: 0 };
  }

  private cd(args: string[]): CommandResult {
    if (args.length === 0) {
      this.currentDir = '/';
      return { output: '', exitCode: 0 };
    }

    const path = this.resolvePath(args[0]);

    // Check if directory exists
    if (!this.fs.exists(path + '/.dir') && path !== '/') {
      return { output: `cd: ${args[0]}: No such file or directory\n`, exitCode: 1 };
    }

    this.currentDir = path;
    return { output: '', exitCode: 0 };
  }

  private mkdir(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'mkdir: missing operand\n', exitCode: 1 };
    }

    for (const arg of args) {
      const path = this.resolvePath(arg);
      this.fs.mkdir(path);
    }

    return { output: '', exitCode: 0 };
  }

  private rm(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'rm: missing operand\n', exitCode: 1 };
    }

    let output = '';
    for (const arg of args) {
      const path = this.resolvePath(arg);

      if (!this.fs.exists(path)) {
        output += `rm: cannot remove '${arg}': No such file or directory\n`;
        continue;
      }

      // Simple deletion - just remove from VFS
      // Note: VirtualFileSystem doesn't have a delete method yet
      output += `rm: delete functionality not yet implemented\n`;
    }

    return { output: output || '', exitCode: output ? 1 : 0 };
  }

  private echo(args: string[]): CommandResult {
    return { output: args.join(' ') + '\n', exitCode: 0 };
  }

  private hexdump(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'hexdump: missing file operand\n', exitCode: 1 };
    }

    const path = this.resolvePath(args[0]);
    const data = this.fs.readFile(path);

    if (!data) {
      return { output: `hexdump: ${args[0]}: No such file or directory\n`, exitCode: 1 };
    }

    let output = '';
    for (let i = 0; i < data.length; i += 16) {
      const offset = i.toString(16).padStart(8, '0');
      const chunk = data.slice(i, i + 16);

      // Hex representation
      const hex = Array.from(chunk)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');

      // ASCII representation
      const ascii = Array.from(chunk)
        .map(b => (b >= 32 && b < 127) ? String.fromCharCode(b) : '.')
        .join('');

      output += `${offset}  ${hex.padEnd(48)}  |${ascii}|\n`;
    }

    return { output, exitCode: 0 };
  }

  private stat(args: string[]): CommandResult {
    if (args.length === 0) {
      return { output: 'stat: missing operand\n', exitCode: 1 };
    }

    let output = '';
    for (const arg of args) {
      const path = this.resolvePath(arg);
      const data = this.fs.readFile(path);
      const isDir = this.fs.exists(path + '/.dir');

      if (!data && !isDir) {
        output += `stat: cannot stat '${arg}': No such file or directory\n`;
        continue;
      }

      const size = data ? data.length : 0;
      const type = isDir ? 'directory' : 'regular file';

      output += `  File: ${path}\n`;
      output += `  Size: ${size}\t\tBlocks: ${Math.ceil(size / 512)}\tIO Block: 4096\t${type}\n`;
      output += `Device: 0h/0d\tInode: 0\tLinks: 1\n`;
      output += `Access: (0644/-rw-r--r--)\n`;
      output += '\n';
    }

    return { output, exitCode: 0 };
  }

  private find(args: string[]): CommandResult {
    const startPath = args.length > 0 ? this.resolvePath(args[0]) : this.currentDir;
    const allFiles = this.fs.listFiles();

    let output = '';
    for (const file of allFiles.sort()) {
      if (file.startsWith(startPath) && !file.endsWith('/.dir')) {
        output += file + '\n';
      }
    }

    return { output, exitCode: 0 };
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'K';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + 'M';
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + 'G';
  }

  private help(): CommandResult {
    const output = `
BattleForge VFS Console - Available Commands:

File Operations:
  ls [-lah] [path]     List directory contents
                       -l: long format, -a: show hidden, -h: human-readable sizes
  cat <file>           Display file contents
  hexdump <file>       Display file in hexadecimal
  stat <file>          Display file statistics
  find [path]          Find all files under path

Directory Operations:
  pwd                  Print working directory
  cd [dir]             Change directory
  mkdir <dir>          Create directory

Utilities:
  echo <text>          Print text
  clear                Clear screen
  help                 Show this help message

Examples:
  ls -lah              List all files in current directory with sizes
  cat /main.c          Display contents of /main.c
  hexdump /main.o      View compiled object file in hex
  find /               List all files in VFS
  stat /main.c         Show file size and metadata
`;
    return { output, exitCode: 0 };
  }
}
