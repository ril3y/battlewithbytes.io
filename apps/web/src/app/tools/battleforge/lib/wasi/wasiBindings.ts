/**
 * WASI Preview 1 Bindings + Emscripten Support
 *
 * Provides WASI system call interface for WebAssembly modules
 * Includes Emscripten-specific syscalls for ARM Clang
 */

/**
 * Mutable reference to WebAssembly Memory
 * Allows setting memory after WASM instantiation
 */
export class MemoryRef {
  memory: WebAssembly.Memory | null = null;
}

/**
 * Simple in-memory virtual filesystem
 */
export class VirtualFileSystem {
  private files: Map<string, Uint8Array> = new Map();

  constructor() {
    // Create root directory marker
    this.files.set('/.dir', new Uint8Array(0));

    // Create standard directories
    this.mkdir('/tmp');
    this.mkdir('/include');
    this.mkdir('/include/stm32');
    this.mkdir('/lib');
    this.mkdir('/sdk');
    this.mkdir('/project');
    this.mkdir('/dev');
    this.mkdir('/usr');
    this.mkdir('/usr/include');

    // Create /dev/null
    this.writeFile('/dev/null', new Uint8Array(0));
  }

  mkdir(path: string): void {
    this.files.set(path + '/.dir', new Uint8Array(0));
  }

  writeFile(path: string, content: Uint8Array | string): void {
    const data = typeof content === 'string'
      ? new TextEncoder().encode(content)
      : content;
    this.files.set(path, data);
    console.log(`[VFS] writeFile: ${path} (${data.length} bytes)`);
  }

  readFile(path: string): Uint8Array | null {
    return this.files.get(path) || null;
  }

  exists(path: string): boolean {
    // Root directory always exists
    if (path === '/' || path === '/.') {
      return true;
    }
    return this.files.has(path) || this.files.has(path + '/.dir');
  }

  isDirectory(path: string): boolean {
    // Root is always a directory
    if (path === '/' || path === '/.' || path === '') {
      return true;
    }
    // Check if path has a .dir marker
    return this.files.has(path + '/.dir');
  }

  isFile(path: string): boolean {
    // Files are entries that exist but don't have a .dir marker
    return this.files.has(path) && !path.endsWith('/.dir');
  }

  deleteFile(path: string): boolean {
    if (this.files.has(path)) {
      this.files.delete(path);
      console.log(`[VFS] deleteFile: ${path}`);
      return true;
    }
    return false;
  }

  listFiles(): string[] {
    return Array.from(this.files.keys());
  }

  clear(): void {
    this.files.clear();
    // Recreate root directory marker
    this.files.set('/.dir', new Uint8Array(0));
    // Recreate all standard directories and special files
    this.mkdir('/tmp');
    this.mkdir('/include');
    this.mkdir('/include/stm32');
    this.mkdir('/lib');
    this.mkdir('/sdk');
    this.mkdir('/project');
    this.mkdir('/dev');
    this.mkdir('/usr');
    this.mkdir('/usr/include');
    this.writeFile('/dev/null', new Uint8Array(0));
  }
}

/**
 * Create WASI Preview 1 bindings
 */
export function createWASIBindings(
  fs: VirtualFileSystem,
  memoryRef: MemoryRef,
  args: string[] = []
) {
  // Helper to get current memory
  const getMemory = (): WebAssembly.Memory => {
    if (!memoryRef.memory) {
      throw new Error('Memory not initialized');
    }
    return memoryRef.memory;
  };

  // File descriptor tracking
  const fds = new Map<number, { path: string; position: number; flags: number }>();
  let nextFd = 3; // 0=stdin, 1=stdout, 2=stderr

  // Preopened directories (fd 3 = root)
  const preopens = new Map<number, string>([[3, '/']]);

  // Stdout/stderr buffers
  let stdoutBuffer = '';
  let stderrBuffer = '';

  // Helper functions
  const readString = (ptr: number, len: number): string => {
    const memory = getMemory();
    const bytes = new Uint8Array(memory.buffer, ptr, len);
    return new TextDecoder().decode(bytes);
  };

  const writeU32 = (ptr: number, value: number): void => {
    const memory = getMemory();
    const view = new DataView(memory.buffer);
    view.setUint32(ptr, value, true);
  };

  const wasiBindings = {
    // Environment variables
    environ_get: (_environ: number, _environ_buf: number) => {
      return 0; // No environment variables
    },

    environ_sizes_get: (environc_ptr: number, environ_buf_size_ptr: number) => {
      const memory = getMemory();
      const view = new DataView(memory.buffer);
      view.setUint32(environc_ptr, 0, true);
      view.setUint32(environ_buf_size_ptr, 0, true);
      return 0;
    },

    // Command-line arguments
    args_sizes_get: (argc_ptr: number, argv_buf_size_ptr: number) => {
      const memory = getMemory();
      const view = new DataView(memory.buffer);

      const argc = args.length;
      const argv_buf_size = args.reduce((sum, arg) => sum + arg.length + 1, 0);

      view.setUint32(argc_ptr, argc, true);
      view.setUint32(argv_buf_size_ptr, argv_buf_size, true);

      return 0;
    },

    args_get: (argv_ptr: number, argv_buf_ptr: number) => {
      const memory = getMemory();
      const view = new DataView(memory.buffer);
      const encoder = new TextEncoder();

      let buf_offset = argv_buf_ptr;

      for (let i = 0; i < args.length; i++) {
        view.setUint32(argv_ptr + i * 4, buf_offset, true);

        const encoded = encoder.encode(args[i] + '\0');
        const bytes = new Uint8Array(memory.buffer, buf_offset, encoded.length);
        bytes.set(encoded);

        buf_offset += encoded.length;
      }

      return 0;
    },

    // File operations
    fd_write: (fd: number, iovs: number, iovsLen: number, nwritten: number) => {
      const memory = getMemory();
      const view = new DataView(memory.buffer);
      const decoder = new TextDecoder();

      let totalWritten = 0;

      // Handle stdout and stderr
      if (fd === 1 || fd === 2) {
        for (let i = 0; i < iovsLen; i++) {
          const ptr = view.getUint32(iovs + i * 8, true);
          const len = view.getUint32(iovs + i * 8 + 4, true);
          const bytes = new Uint8Array(memory.buffer, ptr, len);
          const text = decoder.decode(bytes);

          if (fd === 1) {
            stdoutBuffer += text;
            console.log(text);
          } else {
            stderrBuffer += text;
            console.error(text);
          }

          totalWritten += len;
        }
      } else {
        // Handle file writes
        const fileInfo = fds.get(fd);
        if (!fileInfo) {
          return 8; // EBADF
        }

        // Collect all data to write
        const chunks: Uint8Array[] = [];
        for (let i = 0; i < iovsLen; i++) {
          const ptr = view.getUint32(iovs + i * 8, true);
          const len = view.getUint32(iovs + i * 8 + 4, true);
          const bytes = new Uint8Array(memory.buffer, ptr, len);
          chunks.push(new Uint8Array(bytes)); // Copy the bytes
          totalWritten += len;
        }

        // Get existing file data or create empty
        const existingData = fs.readFile(fileInfo.path) || new Uint8Array(0);

        // Calculate new file size
        const newSize = Math.max(existingData.length, fileInfo.position + totalWritten);
        const newData = new Uint8Array(newSize);

        // Copy existing data
        newData.set(existingData);

        // Write new data at current position
        let offset = fileInfo.position;
        for (const chunk of chunks) {
          newData.set(chunk, offset);
          offset += chunk.length;
        }

        // Update file and position
        fs.writeFile(fileInfo.path, newData);
        fileInfo.position = offset;
      }

      view.setUint32(nwritten, totalWritten, true);
      return 0;
    },

    fd_read: (fd: number, iovs: number, iovsLen: number, nread: number) => {
      const memory = getMemory();
      const view = new DataView(memory.buffer);

      if (fd === 0) {
        view.setUint32(nread, 0, true);
        return 0;
      }

      const fileInfo = fds.get(fd);
      if (!fileInfo) {
        return 8; // EBADF
      }

      const fileData = fs.readFile(fileInfo.path);
      if (!fileData) {
        return 44; // ENOENT
      }

      let totalRead = 0;

      for (let i = 0; i < iovsLen; i++) {
        const ptr = view.getUint32(iovs + i * 8, true);
        const len = view.getUint32(iovs + i * 8 + 4, true);

        const remaining = fileData.length - fileInfo.position;
        const toRead = Math.min(len, remaining);

        if (toRead > 0) {
          const chunk = fileData.slice(fileInfo.position, fileInfo.position + toRead);
          const dest = new Uint8Array(memory.buffer, ptr, toRead);
          dest.set(chunk);

          fileInfo.position += toRead;
          totalRead += toRead;
        }

        if (remaining <= 0) break;
      }

      view.setUint32(nread, totalRead, true);
      return 0;
    },

    fd_close: (fd: number) => {
      if (fd < 3) return 0;
      fds.delete(fd);
      return 0;
    },

    fd_seek: (fd: number, offset: bigint, whence: number, newoffset: number) => {
      const fileInfo = fds.get(fd);
      if (!fileInfo) {
        return 8; // EBADF
      }

      const fileData = fs.readFile(fileInfo.path);
      if (!fileData) {
        return 44; // ENOENT
      }

      let newPosition = fileInfo.position;

      switch (whence) {
        case 0: // SEEK_SET
          newPosition = Number(offset);
          break;
        case 1: // SEEK_CUR
          newPosition = fileInfo.position + Number(offset);
          break;
        case 2: // SEEK_END
          newPosition = fileData.length + Number(offset);
          break;
      }

      fileInfo.position = Math.max(0, Math.min(newPosition, fileData.length));

      const memory = getMemory();
      const view = new DataView(memory.buffer);
      view.setBigUint64(newoffset, BigInt(fileInfo.position), true);

      return 0;
    },

    fd_fdstat_get: (fd: number, buf_ptr: number) => {
      const memory = getMemory();
      const view = new DataView(memory.buffer);

      const isPreopen = preopens.has(fd);
      const isStdStream = fd === 0 || fd === 1 || fd === 2;

      let filetype = 4; // FILETYPE_REGULAR_FILE (default)
      if (isPreopen) {
        filetype = 3; // FILETYPE_DIRECTORY
      } else if (isStdStream) {
        filetype = 2; // FILETYPE_CHARACTER_DEVICE
      }

      view.setUint8(buf_ptr, filetype);
      view.setUint16(buf_ptr + 2, 0, true); // fs_flags
      view.setBigUint64(buf_ptr + 8, 0xFFFFFFFFFFFFFFFFn, true); // fs_rights_base
      view.setBigUint64(buf_ptr + 16, 0xFFFFFFFFFFFFFFFFn, true); // fs_rights_inheriting

      return 0;
    },

    fd_prestat_get: (fd: number, buf_ptr: number) => {
      const preopenPath = preopens.get(fd);
      if (!preopenPath) {
        return 8; // EBADF
      }

      const memory = getMemory();
      const view = new DataView(memory.buffer);

      view.setUint8(buf_ptr, 0); // type: PREOPENED_DIR
      view.setUint32(buf_ptr + 4, preopenPath.length, true); // pr_name_len

      return 0;
    },

    fd_prestat_dir_name: (fd: number, path_ptr: number, path_len: number) => {
      const preopenPath = preopens.get(fd);
      if (!preopenPath) {
        return 8; // EBADF
      }

      const memory = getMemory();
      const encoder = new TextEncoder();
      const encoded = encoder.encode(preopenPath);
      const bytes = new Uint8Array(memory.buffer, path_ptr, Math.min(path_len, encoded.length));
      bytes.set(encoded.slice(0, path_len));

      return 0;
    },

    path_open: (
      fd: number,
      dirflags: number,
      path_ptr: number,
      path_len: number,
      oflags: number,
      fs_rights_base: bigint,
      fs_rights_inheriting: bigint,
      fdflags: number,
      fd_ptr: number
    ) => {
      console.log(`[VFS] path_open CALLED: fd=${fd}, oflags=0x${oflags.toString(16)}`);

      const pathStr = readString(path_ptr, path_len);
      const dirPath = preopens.get(fd) || '/';
      let fullPath = pathStr.startsWith('/') ? pathStr : dirPath + '/' + pathStr;

      // Normalize path (remove double slashes)
      fullPath = fullPath.replace(/\/+/g, '/');

      const O_DIRECTORY = 0x200000;
      const O_CREAT = 0x1;

      // Check if path exists and what type it is
      const isDir = fs.isDirectory(fullPath);
      const isFile = fs.isFile(fullPath);
      const pathExists = isDir || isFile;

      console.log(`[VFS] path_open: ${fullPath}, exists: ${pathExists}, isDir: ${isDir}, isFile: ${isFile}, O_DIRECTORY=${!!(oflags & O_DIRECTORY)}`);

      if (!pathExists) {
        // Create file if O_CREAT flag is set
        if (oflags & O_CREAT) {
          console.log(`[VFS] path_open: Creating new file ${fullPath}`);
          fs.writeFile(fullPath, new Uint8Array(0));
        } else {
          console.log(`[VFS] path_open: File not found, returning ENOENT`);
          return 44; // ENOENT
        }
      } else {
        // Path exists - check O_DIRECTORY flag
        if ((oflags & O_DIRECTORY) && isFile) {
          console.log(`[VFS] path_open: O_DIRECTORY set but ${fullPath} is a file, returning ENOTDIR`);
          return 54; // ENOTDIR - Not a directory
        }
      }

      const fd_num = nextFd++;
      fds.set(fd_num, { path: fullPath, position: 0, flags: fdflags });
      writeU32(fd_ptr, fd_num);

      console.log(`[VFS] path_open: SUCCESS - opened ${fullPath} as fd ${fd_num}`);
      return 0;
    },

    path_filestat_get: (
      fd: number,
      flags: number,
      path_ptr: number,
      path_len: number,
      buf_ptr: number
    ) => {
      const pathStr = readString(path_ptr, path_len);
      const dirPath = preopens.get(fd) || '/';
      let fullPath = pathStr.startsWith('/') ? pathStr : dirPath + '/' + pathStr;

      // Normalize path (remove double slashes, handle . and ..)
      fullPath = fullPath.replace(/\/+/g, '/');
      if (fullPath.endsWith('/.')) {
        fullPath = fullPath.slice(0, -2) || '/';
      }

      const isDir = fs.isDirectory(fullPath);
      const isFile = fs.isFile(fullPath);
      const pathExists = isDir || isFile;

      console.log(`[VFS] path_filestat_get: fd=${fd}, path="${pathStr}", fullPath="${fullPath}", exists: ${pathExists}, isDir: ${isDir}, isFile: ${isFile}`);

      if (!pathExists) {
        console.log(`[VFS] path_filestat_get: File not found: "${fullPath}"`);
        return 44; // ENOENT
      }

      const fileData = isFile ? fs.readFile(fullPath) : null;

      const memory = getMemory();
      const view = new DataView(memory.buffer);

      // Write filestat structure
      // filetype: 3 = directory, 4 = regular file
      view.setBigUint64(buf_ptr, 0n, true); // dev
      view.setBigUint64(buf_ptr + 8, 0n, true); // ino
      view.setUint8(buf_ptr + 16, isDir ? 3 : 4); // filetype
      view.setBigUint64(buf_ptr + 24, 1n, true); // nlink
      view.setBigUint64(buf_ptr + 32, BigInt(fileData ? fileData.length : 0), true); // size
      view.setBigUint64(buf_ptr + 40, 0n, true); // atim
      view.setBigUint64(buf_ptr + 48, 0n, true); // mtim
      view.setBigUint64(buf_ptr + 56, 0n, true); // ctim

      return 0;
    },

    // Stubs for unimplemented WASI functions
    path_create_directory: () => 0,
    path_remove_directory: () => 0,
    path_unlink_file: () => 0,
    fd_filestat_get: () => 0,
    fd_filestat_set_size: () => 0,
    fd_readdir: () => 0,

    path_rename: (
      old_fd: number,
      old_path_ptr: number,
      old_path_len: number,
      new_fd: number,
      new_path_ptr: number,
      new_path_len: number
    ) => {
      const oldPathStr = readString(old_path_ptr, old_path_len);
      const newPathStr = readString(new_path_ptr, new_path_len);

      const oldDirPath = preopens.get(old_fd) || '/';
      const newDirPath = preopens.get(new_fd) || '/';

      let oldFullPath = oldPathStr.startsWith('/') ? oldPathStr : oldDirPath + '/' + oldPathStr;
      let newFullPath = newPathStr.startsWith('/') ? newPathStr : newDirPath + '/' + newPathStr;

      // Normalize paths
      oldFullPath = oldFullPath.replace(/\/+/g, '/');
      newFullPath = newFullPath.replace(/\/+/g, '/');

      console.log(`[VFS] path_rename: "${oldFullPath}" -> "${newFullPath}"`);

      const data = fs.readFile(oldFullPath);
      if (!data) {
        console.log(`[VFS] path_rename: Source file not found: ${oldFullPath}`);
        return 44; // ENOENT
      }

      // Write to new path and delete old path
      fs.writeFile(newFullPath, data);
      fs.deleteFile(oldFullPath);

      console.log(`[VFS] path_rename: SUCCESS - renamed ${oldFullPath} to ${newFullPath} (${data.length} bytes)`);
      return 0;
    },

    path_readlink: (
      _fd: number,
      _path_ptr: number,
      _path_len: number,
      _buf_ptr: number,
      _buf_len: number,
      _bufused_ptr: number
    ) => {
      return 0;
    },

    path_link: () => 0,
    path_symlink: () => 0,
    fd_allocate: () => 0,
    fd_datasync: () => 0,
    fd_sync: () => 0,
    fd_tell: () => 0,
    fd_fdstat_set_flags: () => 0,
    fd_filestat_set_times: (_fd: number, _atim: bigint, _mtim: bigint, _fst_flags: number) => 0,
    fd_pread: (_fd: number, _iovs: number, _iovsLen: number, _offset: bigint, _nread: number) => 0,
    fd_advise: (_fd: number, _offset: bigint, _len: bigint, _advice: number) => 0,

    poll_oneoff: (
      _in_: number,
      _out: number,
      _nsubscriptions: number,
      _nevents: number
    ) => {
      return 0;
    },

    proc_exit: (code: number) => {
      throw { exitCode: code };
    },

    proc_raise: () => 0,
    sched_yield: () => 0,
    random_get: () => 0,
    clock_time_get: () => 0,
    clock_res_get: () => 0,

    // Output getters
    getStdout: () => stdoutBuffer,
    getStderr: () => stderrBuffer,
    clearOutput: () => {
      stdoutBuffer = '';
      stderrBuffer = '';
    }
  };

  return wasiBindings;
}

/**
 * Create complete WASM imports for Clang
 *
 * The Clang WASM binary is built with Emscripten and requires:
 * - wasi_snapshot_preview1: WASI standard functions
 * - env: Emscripten runtime and syscalls
 * - GOT.mem: Global offset table for heap
 */
export function createClangImports(fs: VirtualFileSystem, args: string[] = []) {
  // DON'T create memory - let WASM export it (it needs ~19MB)
  // We'll set memoryRef.memory after instantiation from the exported memory

  // Create indirect function table (Clang needs ~28273 slots)
  const table = new WebAssembly.Table({
    initial: 30000,
    maximum: 30000,
    element: 'anyfunc'
  });

  // Create MemoryRef (will be set after WASM instantiation)
  const memoryRef = new MemoryRef();

  const wasi = createWASIBindings(fs, memoryRef, args);

  // Helper to get memory
  const getMemory = (): WebAssembly.Memory | null => memoryRef.memory;

  const importsObj = {
    // WASI Snapshot Preview 1 - standard WASI functions
    wasi_snapshot_preview1: wasi,

    // Emscripten env module - runtime support and syscalls
    env: {
      // DON'T provide memory here - WASM exports its own
      __indirect_function_table: table,
      __memory_base: 1024,
      __stack_pointer: new WebAssembly.Global({ value: 'i32', mutable: true }, 65536),
      __table_base: 0,

      // System calls - most return -1 (not implemented) or 0 (success)
      __syscall_openat: (dirfd: number, path_ptr: number, flags: number, mode: number) => {
        // Read path from memory
        const memory = getMemory();
        if (!memory) return -1;

        // Find null terminator to get path length
        const memoryView = new Uint8Array(memory.buffer, path_ptr);
        let pathLen = 0;
        while (memoryView[pathLen] !== 0 && pathLen < 4096) pathLen++;

        const pathBytes = new Uint8Array(memory.buffer, path_ptr, pathLen);
        const pathStr = new TextDecoder().decode(pathBytes);

        console.log(`[VFS] __syscall_openat: dirfd=${dirfd}, path="${pathStr}", flags=${flags}`);

        // Handle AT_FDCWD (-100) - use root preopen (fd 3)
        // AT_FDCWD means "current working directory", which we treat as root
        const AT_FDCWD = -100;
        let actualDirFd = dirfd;

        if (dirfd === AT_FDCWD || dirfd < 0) {
          actualDirFd = 3; // Use root preopen directory
          console.log(`[VFS] __syscall_openat: Converted special dirfd ${dirfd} to root preopen (3)`);
        }

        // Delegate to WASI path_open
        // Allocate temporary space for fd output
        const fd_ptr = path_ptr + pathLen + 8; // Use space after path string

        const result = wasi.path_open(
          actualDirFd,
          0, // dirflags
          path_ptr,
          pathLen,
          flags,
          0n, // fs_rights_base
          0n, // fs_rights_inheriting
          0, // fdflags
          fd_ptr
        );

        if (result !== 0) {
          console.log(`[VFS] __syscall_openat: path_open failed with error ${result} for "${pathStr}"`);
          return -result; // Return negative errno
        }

        // Read the fd that was written
        const view = new DataView(memory.buffer);
        const fd = view.getUint32(fd_ptr, true);
        console.log(`[VFS] __syscall_openat: Successfully opened "${pathStr}" as fd ${fd}`);
        return fd;
      },

      __syscall_readv: (fd: number, iov: number, iovcnt: number) => {
        const memory = getMemory();
        if (!memory) return -1;

        const view = new DataView(memory.buffer);
        let totalRead = 0;

        for (let i = 0; i < iovcnt; i++) {
          const buf = view.getUint32(iov + i * 8, true);
          const len = view.getUint32(iov + i * 8 + 4, true);

          // Create a temporary iov for this single buffer
          const tempIov = buf - 16; // Use some space before buf
          view.setUint32(tempIov, buf, true);
          view.setUint32(tempIov + 4, len, true);

          const nreadPtr = buf - 8;
          const result = wasi.fd_read(fd, tempIov, 1, nreadPtr);

          if (result !== 0) {
            return -result;
          }

          const nread = view.getUint32(nreadPtr, true);
          totalRead += nread;

          if (nread < len) break; // End of file
        }

        return totalRead;
      },

      __syscall_writev: (fd: number, iov: number, iovcnt: number) => {
        const memory = getMemory();
        if (!memory) return -1;

        const view = new DataView(memory.buffer);
        const decoder = new TextDecoder();
        let totalWritten = 0;

        for (let i = 0; i < iovcnt; i++) {
          const buf = view.getUint32(iov + i * 8, true);
          const len = view.getUint32(iov + i * 8 + 4, true);

          const bytes = new Uint8Array(memory.buffer, buf, len);
          const text = decoder.decode(bytes);

          // Capture stdout/stderr - delegate to WASI fd_write which buffers
          if (fd === 1 || fd === 2) {
            console.log(fd === 1 ? '[STDOUT]' : '[STDERR]', text);
            // Use WASI fd_write to properly capture and buffer
            wasi.fd_write(fd, iov + i * 8, 1, 0);
          }

          totalWritten += len;
        }

        return totalWritten;
      },

      __syscall_close: (fd: number) => {
        const result = wasi.fd_close(fd);
        return result === 0 ? 0 : -result;
      },

      __syscall_fstat64: (fd: number, statbuf: number) => {
        const memory = getMemory();
        if (!memory) return -1;

        // For simplicity, return success with zeros
        const view = new DataView(memory.buffer);
        for (let i = 0; i < 128; i += 8) {
          view.setBigUint64(statbuf + i, 0n, true);
        }
        return 0;
      },

      __syscall_newfstatat: (dirfd: number, path_ptr: number, statbuf: number, flags: number) => {
        const memory = getMemory();
        if (!memory) return -1;

        // Find path length
        const memoryView = new Uint8Array(memory.buffer, path_ptr);
        let pathLen = 0;
        while (memoryView[pathLen] !== 0 && pathLen < 4096) pathLen++;

        const pathBytes = new Uint8Array(memory.buffer, path_ptr, pathLen);
        const pathStr = new TextDecoder().decode(pathBytes);

        console.log(`[VFS] __syscall_newfstatat: dirfd=${dirfd}, path="${pathStr}", flags=${flags}`);

        // Handle AT_FDCWD (-100) - use root preopen (fd 3)
        const AT_FDCWD = -100;
        let actualDirFd = dirfd;

        if (dirfd === AT_FDCWD || dirfd < 0) {
          actualDirFd = 3; // Use root preopen directory
          console.log(`[VFS] __syscall_newfstatat: Converted special dirfd ${dirfd} to root preopen (3)`);
        }

        // Use WASI path_filestat_get
        const result = wasi.path_filestat_get(actualDirFd, flags, path_ptr, pathLen, statbuf);
        console.log(`[VFS] __syscall_newfstatat: path_filestat_get returned ${result} for "${pathStr}"`);
        return result === 0 ? 0 : -result;
      },

      __syscall_ioctl: () => -1,
      __syscall_fcntl64: () => -1,

      __syscall_unlinkat: (dirfd: number, path_ptr: number, flags: number) => {
        const memory = getMemory();
        if (!memory) return -1;

        // Find path length
        const memoryView = new Uint8Array(memory.buffer, path_ptr);
        let pathLen = 0;
        while (memoryView[pathLen] !== 0 && pathLen < 4096) pathLen++;

        const pathBytes = new Uint8Array(memory.buffer, path_ptr, pathLen);
        const pathStr = new TextDecoder().decode(pathBytes);

        console.log(`[VFS] __syscall_unlinkat: dirfd=${dirfd}, path="${pathStr}", flags=${flags}`);

        // Handle AT_FDCWD (-100)
        const AT_FDCWD = -100;
        let fullPath = pathStr;
        if (!pathStr.startsWith('/')) {
          fullPath = '/' + pathStr;
        }

        // Delete the file from VFS
        const deleted = fs.deleteFile(fullPath);
        console.log(`[VFS] __syscall_unlinkat: ${deleted ? 'deleted' : 'not found'} ${fullPath}`);
        return deleted ? 0 : -2; // ENOENT
      },

      __syscall_renameat: (olddirfd: number, oldpath_ptr: number, newdirfd: number, newpath_ptr: number) => {
        const memory = getMemory();
        if (!memory) return -1;

        // Read old path
        const memoryView = new Uint8Array(memory.buffer);
        let oldLen = 0;
        while (memoryView[oldpath_ptr + oldLen] !== 0 && oldLen < 4096) oldLen++;
        const oldPath = new TextDecoder().decode(new Uint8Array(memory.buffer, oldpath_ptr, oldLen));

        // Read new path
        let newLen = 0;
        while (memoryView[newpath_ptr + newLen] !== 0 && newLen < 4096) newLen++;
        const newPath = new TextDecoder().decode(new Uint8Array(memory.buffer, newpath_ptr, newLen));

        console.log(`[VFS] __syscall_renameat: "${oldPath}" -> "${newPath}"`);

        const fullOldPath = oldPath.startsWith('/') ? oldPath : '/' + oldPath;
        const fullNewPath = newPath.startsWith('/') ? newPath : '/' + newPath;

        const data = fs.readFile(fullOldPath);
        if (!data) {
          console.log(`[VFS] __syscall_renameat: source not found`);
          return -2; // ENOENT
        }

        fs.writeFile(fullNewPath, data);
        fs.deleteFile(fullOldPath);
        console.log(`[VFS] __syscall_renameat: SUCCESS`);
        return 0;
      },

      // Additional syscalls needed by Emscripten
      __syscall_chdir: () => 0, // Always succeed (we use absolute paths)
      __syscall_statfs64: () => 0, // Stub
      __syscall_dup3: () => -1,
      __syscall_pipe2: () => -1,
      __syscall_socket: () => -1,
      __syscall_connect: () => -1,
      __syscall_bind: () => -1,
      __syscall_listen: () => -1,
      __syscall_accept4: () => -1,
      __syscall_getsockname: () => -1,
      __syscall_getpeername: () => -1,
      __syscall_sendto: () => -1,
      __syscall_recvfrom: () => -1,
      __syscall_shutdown: () => -1,
      __syscall_setsockopt: () => -1,
      __syscall_getsockopt: () => -1,
      __syscall_sendmsg: () => -1,
      __syscall_recvmsg: () => -1,
      __syscall_fchmod: () => 0,
      __syscall_fchmodat: () => 0,
      __syscall_fchown32: () => 0,
      __syscall_fchownat: () => 0,
      __syscall_ftruncate64: () => 0,
      __syscall_getcwd: (buf: number, size: number) => {
        const memory = getMemory();
        if (!memory) return -1;
        const cwd = '/';
        const encoder = new TextEncoder();
        const encoded = encoder.encode(cwd + '\0');
        new Uint8Array(memory.buffer, buf, encoded.length).set(encoded);
        return buf;
      },
      __syscall_getdents64: () => 0,
      __syscall_lstat64: () => -1,
      __syscall_stat64: () => -1,
      __syscall_mkdirat: () => 0,
      __syscall_rmdir: () => 0,
      __syscall_faccessat: () => 0,
      __syscall_utimensat: () => 0,
      __syscall_poll: () => 0,
      __syscall_pselect6: () => 0,
      __syscall_readlinkat: () => -1,
      __syscall_symlinkat: () => -1,
      __syscall_linkat: () => -1,

      // Emscripten runtime functions
      emscripten_notify_memory_growth: (_idx: number) => {
        // Memory growth notification - no action needed
      },
      _emscripten_throw_longjmp: () => {
        throw new Error('longjmp called');
      },

      // Invoke wrappers for dynamic calls (used by Emscripten's function pointer system)
      invoke_vi: (_idx: number, _a: number) => {
        // void function(int) - stub
      },
      invoke_ii: (_idx: number, _a: number) => {
        // int function(int) - stub
        return 0;
      }
    },

    // GOT (Global Offset Table) - used for dynamic linking
    'GOT.mem': {
      __heap_base: new WebAssembly.Global({ value: 'i32', mutable: true }, 1048576)
    }
  };

  // Return imports and internal references separately
  return {
    imports: importsObj,
    wasiBindings: wasi,
    memoryRef: memoryRef
  };
}

/**
 * Helper to load and instantiate Clang WASM
 */
export async function loadClangWASM(wasmUrl: string, fs: VirtualFileSystem) {
  // Fetch WASM file
  const response = await fetch(wasmUrl);

  // Check if compressed
  const isGzipped = wasmUrl.endsWith('.gz');

  let wasmBytes: ArrayBuffer;

  if (isGzipped) {
    // Decompress gzip
    const compressed = await response.arrayBuffer();
    const decompressed = await new Response(
      new Blob([compressed])
        .stream()
        .pipeThrough(new DecompressionStream('gzip'))
    ).arrayBuffer();
    wasmBytes = decompressed;
  } else {
    wasmBytes = await response.arrayBuffer();
  }

  // Create imports
  const { imports } = createClangImports(fs);

  // Instantiate
  const { instance } = await WebAssembly.instantiate(wasmBytes, imports);

  return instance;
}
