/**
 * CHeaderCompletionProvider
 *
 * Provides autocomplete suggestions for #include directives in C/C++ files.
 * Scans the VFS for available headers and suggests them as the user types.
 */

import type * as Monaco from "monaco-editor";

export interface HeaderSource {
  /** Base path in VFS (e.g., '/libs/freertos/include') */
  basePath: string;
  /** Category for grouping (e.g., 'library', 'platform', 'libc') */
  category: "library" | "platform" | "libc" | "user";
  /** Library or source name for display */
  sourceName: string;
}

export interface AvailableHeader {
  /** The include path (e.g., 'FreeRTOS.h' or 'freertos/FreeRTOS.h') */
  includePath: string;
  /** Full VFS path to the file */
  fullPath: string;
  /** Source information */
  source: HeaderSource;
}

type VFSGetFilesFunc = () => Map<
  string,
  { content: string | Uint8Array; readOnly?: boolean }
>;

/**
 * Creates a Monaco completion provider for C/C++ #include directives
 */
// Characters that trigger completion inside #include directives
const TRIGGER_CHARS = [
  '"',
  "<",
  "/",
  // Letters to re-trigger after deletion
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "_",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ".",
];

export function createCHeaderCompletionProvider(
  monaco: typeof Monaco,
  getVFSFiles: VFSGetFilesFunc,
): Monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: TRIGGER_CHARS,

    provideCompletionItems(
      model: Monaco.editor.ITextModel,
      position: Monaco.Position,
      _context: Monaco.languages.CompletionContext,
      _token: Monaco.CancellationToken,
    ): Monaco.languages.ProviderResult<Monaco.languages.CompletionList> {
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column - 1);

      // Check if we're in an #include directive
      const includeMatch = textUntilPosition.match(
        /#include\s*([<"])([^>"]*)?$/,
      );
      if (!includeMatch) {
        return { suggestions: [] };
      }

      const isSystemInclude = includeMatch[1] === "<";
      const typedPath = includeMatch[2] || "";

      // Get all available headers
      const headers = scanAvailableHeaders(getVFSFiles);

      // Filter headers based on what's been typed
      const filteredHeaders = filterHeaders(
        headers,
        typedPath,
        isSystemInclude,
      );

      // Convert to Monaco completion items
      const suggestions = filteredHeaders.map((header, index) =>
        createCompletionItem(
          monaco,
          header,
          position,
          typedPath,
          isSystemInclude,
          index,
        ),
      );

      return { suggestions };
    },
  };
}

/**
 * Scans the VFS for all available header files
 */
function scanAvailableHeaders(getVFSFiles: VFSGetFilesFunc): AvailableHeader[] {
  const headers: AvailableHeader[] = [];
  const files = getVFSFiles();

  for (const [path] of files) {
    // Only process header files
    if (!path.endsWith(".h") && !path.endsWith(".hpp")) {
      continue;
    }

    const source = categorizeHeaderPath(path);
    if (!source) continue;

    // Generate include paths based on the source category
    const includePaths = generateIncludePaths(path, source);

    for (const includePath of includePaths) {
      headers.push({
        includePath,
        fullPath: path,
        source,
      });
    }
  }

  return headers;
}

/**
 * Categorizes a header file based on its VFS path
 */
function categorizeHeaderPath(path: string): HeaderSource | null {
  // Library headers: /libs/{libname}/...
  const libMatch = path.match(/^\/libs\/([^/]+)\//);
  if (libMatch) {
    return {
      basePath: `/libs/${libMatch[1]}`,
      category: "library",
      sourceName: libMatch[1],
    };
  }

  // Platform headers: /cmsis/... or /device/...
  if (path.startsWith("/cmsis/")) {
    return {
      basePath: "/cmsis",
      category: "platform",
      sourceName: "CMSIS",
    };
  }

  if (path.startsWith("/device/")) {
    return {
      basePath: "/device",
      category: "platform",
      sourceName: "Device",
    };
  }

  // Standard library headers: /libc/...
  if (path.startsWith("/libc/")) {
    return {
      basePath: "/libc",
      category: "libc",
      sourceName: "libc",
    };
  }

  // User headers: /src/... or /include/...
  if (path.startsWith("/src/") || path.startsWith("/include/")) {
    return {
      basePath: path.startsWith("/src/") ? "/src" : "/include",
      category: "user",
      sourceName: "Project",
    };
  }

  return null;
}

/**
 * Generates possible include paths for a header file
 */
function generateIncludePaths(
  fullPath: string,
  source: HeaderSource,
): string[] {
  const paths: string[] = [];
  const filename = fullPath.split("/").pop() || "";

  // Always add the filename itself
  paths.push(filename);

  // For library headers, add various include path options
  if (source.category === "library") {
    // /libs/freertos/include/FreeRTOS.h -> FreeRTOS.h
    // /libs/freertos/include/task.h -> task.h
    const afterInclude = fullPath.replace(/^\/libs\/[^/]+\/include\//, "");
    if (afterInclude !== fullPath) {
      paths.push(afterInclude);
    }

    // Also allow libname/header.h style
    const afterLibs = fullPath.replace(/^\/libs\//, "");
    paths.push(afterLibs);

    // And libname/include/header.h
    const withInclude = afterLibs;
    if (!paths.includes(withInclude)) {
      paths.push(withInclude);
    }
  }

  // For platform headers
  if (source.category === "platform") {
    const afterBase = fullPath.replace(/^\/(cmsis|device)\//, "");
    if (afterBase !== fullPath && !paths.includes(afterBase)) {
      paths.push(afterBase);
    }
  }

  // Remove duplicates
  return [...new Set(paths)];
}

/**
 * Filters headers based on user input
 */
function filterHeaders(
  headers: AvailableHeader[],
  typedPath: string,
  _isSystemInclude: boolean,
): AvailableHeader[] {
  const lowerTyped = typedPath.toLowerCase();

  // Filter headers that match the typed prefix
  const matched = headers.filter((header) => {
    const lowerInclude = header.includePath.toLowerCase();

    // Match from start
    if (lowerInclude.startsWith(lowerTyped)) {
      return true;
    }

    // Also match if the filename starts with typed text
    const filename = header.includePath.split("/").pop() || "";
    if (filename.toLowerCase().startsWith(lowerTyped)) {
      return true;
    }

    // Fuzzy match: typed text appears anywhere
    if (lowerInclude.includes(lowerTyped)) {
      return true;
    }

    return false;
  });

  // Sort by relevance
  return matched.sort((a, b) => {
    const aLower = a.includePath.toLowerCase();
    const bLower = b.includePath.toLowerCase();

    // Prefer exact prefix matches
    const aStartsWith = aLower.startsWith(lowerTyped);
    const bStartsWith = bLower.startsWith(lowerTyped);
    if (aStartsWith && !bStartsWith) return -1;
    if (bStartsWith && !aStartsWith) return 1;

    // Prefer shorter paths
    if (a.includePath.length !== b.includePath.length) {
      return a.includePath.length - b.includePath.length;
    }

    // Alphabetical
    return aLower.localeCompare(bLower);
  });
}

/**
 * Creates a Monaco completion item for a header
 */
function createCompletionItem(
  monaco: typeof Monaco,
  header: AvailableHeader,
  position: Monaco.Position,
  typedPath: string,
  isSystemInclude: boolean,
  sortIndex: number,
): Monaco.languages.CompletionItem {
  const closeChar = isSystemInclude ? ">" : '"';

  // Determine what text to insert (replacing what user typed)
  const insertText = header.includePath + closeChar;

  // Calculate the range to replace (from after the opening quote/bracket)
  const lineContent = position.lineNumber;
  const startColumn = position.column - typedPath.length;

  // Category-specific icons and details
  let kind: Monaco.languages.CompletionItemKind;
  let detail: string;

  switch (header.source.category) {
    case "library":
      kind = monaco.languages.CompletionItemKind.Module;
      detail = `Library: ${header.source.sourceName}`;
      break;
    case "platform":
      kind = monaco.languages.CompletionItemKind.Interface;
      detail = `Platform: ${header.source.sourceName}`;
      break;
    case "libc":
      kind = monaco.languages.CompletionItemKind.Reference;
      detail = "Standard Library";
      break;
    case "user":
      kind = monaco.languages.CompletionItemKind.File;
      detail = "Project Header";
      break;
    default:
      kind = monaco.languages.CompletionItemKind.File;
      detail = "";
  }

  return {
    label: header.includePath,
    kind,
    detail,
    documentation: {
      value: `**${header.includePath}**\n\nFull path: \`${header.fullPath}\``,
    },
    insertText,
    range: {
      startLineNumber: lineContent,
      startColumn,
      endLineNumber: lineContent,
      endColumn: position.column,
    },
    sortText: String(sortIndex).padStart(5, "0"),
    filterText: header.includePath,
  };
}

/**
 * Registers the C header completion provider with Monaco
 */
export function registerCHeaderCompletion(
  monaco: typeof Monaco,
  getVFSFiles: VFSGetFilesFunc,
): Monaco.IDisposable {
  const provider = createCHeaderCompletionProvider(monaco, getVFSFiles);

  // Register for both C and C++
  const disposables = [
    monaco.languages.registerCompletionItemProvider("c", provider),
    monaco.languages.registerCompletionItemProvider("cpp", provider),
  ];

  // Return a composite disposable
  return {
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
