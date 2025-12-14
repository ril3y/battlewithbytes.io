"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";

interface HexViewerProps {
  data: Uint8Array;
  filename?: string;
  bytesPerRow?: number;
}

// Check if a byte is a printable ASCII character
function isPrintable(byte: number): boolean {
  return byte >= 0x20 && byte <= 0x7e;
}

// Format a number as hex with padding
function toHex(value: number, padding: number): string {
  return value.toString(16).toUpperCase().padStart(padding, "0");
}

const ROW_HEIGHT = 24; // Height of each row in pixels
const BUFFER_ROWS = 10; // Extra rows to render above/below viewport

export function HexViewer({
  data,
  filename,
  bytesPerRow = 16,
}: HexViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // Selection state - supports single click and range selection
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Virtual scrolling state
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  // Calculate selection range (normalized so start <= end)
  const selectionRange = useMemo(() => {
    if (selectionStart === null) return null;
    const end = selectionEnd ?? selectionStart;
    return {
      start: Math.min(selectionStart, end),
      end: Math.max(selectionStart, end),
    };
  }, [selectionStart, selectionEnd]);

  // Check if an offset is in the selection range
  const isInSelection = useCallback(
    (offset: number): boolean => {
      if (!selectionRange) return false;
      return offset >= selectionRange.start && offset <= selectionRange.end;
    },
    [selectionRange],
  );

  // Mouse handlers for range selection
  const handleByteMouseDown = useCallback(
    (offset: number, e: React.MouseEvent) => {
      e.preventDefault();
      setSelectionStart(offset);
      setSelectionEnd(offset);
      setIsSelecting(true);
    },
    [],
  );

  const handleByteMouseEnter = useCallback(
    (offset: number) => {
      if (isSelecting) {
        setSelectionEnd(offset);
      }
    },
    [isSelecting],
  );

  // Global mouse up to end selection
  useEffect(() => {
    const handleMouseUp = () => {
      setIsSelecting(false);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Calculate the number of hex digits needed for offset display
  const offsetDigits = useMemo(() => {
    return Math.max(4, Math.ceil(Math.log2(data.length + 1) / 4) * 2);
  }, [data.length]);

  // Total number of rows
  const totalRows = useMemo(() => {
    return Math.ceil(data.length / bytesPerRow);
  }, [data.length, bytesPerRow]);

  // Total height of all rows
  const totalHeight = totalRows * ROW_HEIGHT;

  // Calculate visible row range
  const visibleRange = useMemo(() => {
    const startRow = Math.max(
      0,
      Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS,
    );
    const visibleRows =
      Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_ROWS * 2;
    const endRow = Math.min(totalRows, startRow + visibleRows);
    return { startRow, endRow };
  }, [scrollTop, containerHeight, totalRows]);

  // Generate only visible rows
  const visibleRows = useMemo(() => {
    const result: Array<{
      offset: number;
      rowIndex: number;
      bytes: Array<{ value: number; offset: number } | null>;
      ascii: string;
    }> = [];

    for (
      let rowIndex = visibleRange.startRow;
      rowIndex < visibleRange.endRow;
      rowIndex++
    ) {
      const offset = rowIndex * bytesPerRow;
      const bytes: Array<{ value: number; offset: number } | null> = [];
      let ascii = "";

      for (let j = 0; j < bytesPerRow; j++) {
        const byteOffset = offset + j;
        if (byteOffset < data.length) {
          const byte = data[byteOffset];
          bytes.push({ value: byte, offset: byteOffset });
          ascii += isPrintable(byte) ? String.fromCharCode(byte) : ".";
        } else {
          bytes.push(null);
          ascii += " ";
        }
      }

      result.push({ offset, rowIndex, bytes, ascii });
    }

    return result;
  }, [data, bytesPerRow, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Update container height on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Scroll to a specific offset
  const scrollToOffset = useCallback(
    (offset: number) => {
      const rowIndex = Math.floor(offset / bytesPerRow);
      const targetScrollTop =
        rowIndex * ROW_HEIGHT - containerHeight / 2 + ROW_HEIGHT / 2;

      if (containerRef.current) {
        containerRef.current.scrollTop = Math.max(0, targetScrollTop);
      }
    },
    [bytesPerRow, containerHeight],
  );

  // Search functionality
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results: number[] = [];
    const query = searchQuery.trim().toLowerCase();

    // Check if it's a hex search (starts with 0x or contains only hex chars and spaces)
    const isHexSearch = query.startsWith("0x") || /^[0-9a-f\s]+$/.test(query);
    let searchLen = 0;

    if (isHexSearch) {
      // Parse hex bytes
      const hexStr = query.replace(/^0x/, "").replace(/\s+/g, "");
      if (hexStr.length % 2 !== 0) return;

      const searchBytes: number[] = [];
      for (let i = 0; i < hexStr.length; i += 2) {
        searchBytes.push(parseInt(hexStr.slice(i, i + 2), 16));
      }
      searchLen = searchBytes.length;

      // Search for byte sequence
      for (let i = 0; i <= data.length - searchBytes.length; i++) {
        let match = true;
        for (let j = 0; j < searchBytes.length; j++) {
          if (data[i + j] !== searchBytes[j]) {
            match = false;
            break;
          }
        }
        if (match) results.push(i);
      }
    } else {
      // ASCII search
      const searchBytes = new TextEncoder().encode(query);
      searchLen = searchBytes.length;
      for (let i = 0; i <= data.length - searchBytes.length; i++) {
        let match = true;
        for (let j = 0; j < searchBytes.length; j++) {
          if (data[i + j] !== searchBytes[j]) {
            match = false;
            break;
          }
        }
        if (match) results.push(i);
      }
    }

    setSearchResults(results);
    setCurrentSearchIndex(0);
    if (results.length > 0) {
      // Select the search result range
      setSelectionStart(results[0]);
      setSelectionEnd(results[0] + searchLen - 1);
      scrollToOffset(results[0]);
    }
  }, [searchQuery, data, scrollToOffset]);

  const navigateSearch = useCallback(
    (direction: "next" | "prev") => {
      if (searchResults.length === 0) return;

      let newIndex = currentSearchIndex;
      if (direction === "next") {
        newIndex = (currentSearchIndex + 1) % searchResults.length;
      } else {
        newIndex =
          (currentSearchIndex - 1 + searchResults.length) %
          searchResults.length;
      }

      setCurrentSearchIndex(newIndex);

      // Calculate search length and select the range
      const query = searchQuery.trim().toLowerCase();
      const isHexSearch = query.startsWith("0x") || /^[0-9a-f\s]+$/.test(query);
      const searchLen = isHexSearch
        ? query.replace(/^0x/, "").replace(/\s+/g, "").length / 2
        : query.length;

      setSelectionStart(searchResults[newIndex]);
      setSelectionEnd(searchResults[newIndex] + searchLen - 1);
      scrollToOffset(searchResults[newIndex]);
    },
    [searchResults, currentSearchIndex, scrollToOffset, searchQuery],
  );

  // Check if an offset is part of the current search result
  const isSearchHighlight = useCallback(
    (offset: number): boolean => {
      if (searchResults.length === 0) return false;
      const currentResult = searchResults[currentSearchIndex];
      const searchLen =
        searchQuery.startsWith("0x") ||
        /^[0-9a-f\s]+$/.test(searchQuery.toLowerCase())
          ? searchQuery.replace(/^0x/, "").replace(/\s+/g, "").length / 2
          : searchQuery.length;
      return offset >= currentResult && offset < currentResult + searchLen;
    },
    [searchResults, currentSearchIndex, searchQuery],
  );

  // Jump to offset input
  const [jumpOffset, setJumpOffset] = useState("");
  const handleJumpToOffset = useCallback(() => {
    const offset = jumpOffset.startsWith("0x")
      ? parseInt(jumpOffset, 16)
      : parseInt(jumpOffset, 10);

    if (!isNaN(offset) && offset >= 0 && offset < data.length) {
      setSelectionStart(offset);
      setSelectionEnd(offset);
      scrollToOffset(offset);
    }
    setJumpOffset("");
  }, [jumpOffset, data.length, scrollToOffset]);

  return (
    <div className="hex-viewer">
      {/* Header */}
      <div className="hex-header">
        <div className="hex-info">
          {filename && <span className="hex-filename">{filename}</span>}
          <span className="hex-size">{data.length.toLocaleString()} bytes</span>
          <span className="hex-rows">{totalRows.toLocaleString()} rows</span>
        </div>
        <div className="hex-controls">
          <div className="hex-jump">
            <input
              type="text"
              placeholder="Go to offset..."
              value={jumpOffset}
              onChange={(e) => setJumpOffset(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJumpToOffset();
              }}
            />
            <button onClick={handleJumpToOffset}>Go</button>
          </div>
          <div className="hex-search">
            <input
              type="text"
              placeholder="Search hex (0x...) or ASCII..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button onClick={handleSearch}>Find</button>
            {searchResults.length > 0 && (
              <>
                <button onClick={() => navigateSearch("prev")}>&lt;</button>
                <span className="search-count">
                  {currentSearchIndex + 1}/{searchResults.length}
                </span>
                <button onClick={() => navigateSearch("next")}>&gt;</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="hex-columns">
        <span className="hex-offset-header">Offset</span>
        <span className="hex-bytes-header">
          {Array.from({ length: bytesPerRow }, (_, i) => toHex(i, 2)).join(" ")}
        </span>
        <span className="hex-ascii-header">ASCII</span>
      </div>

      {/* Hex content with virtual scrolling */}
      <div className="hex-content" ref={containerRef} onScroll={handleScroll}>
        <div
          className="hex-content-inner"
          style={{ height: totalHeight, position: "relative" }}
        >
          {visibleRows.map((row) => (
            <div
              key={row.offset}
              className="hex-row"
              style={{
                position: "absolute",
                top: row.rowIndex * ROW_HEIGHT,
                left: 0,
                right: 0,
                height: ROW_HEIGHT,
              }}
            >
              <span className="hex-offset">
                {toHex(row.offset, offsetDigits)}
              </span>
              <span className="hex-bytes">
                {row.bytes.map((byte, i) => (
                  <span
                    key={i}
                    className={`hex-byte ${byte === null ? "empty" : ""} ${
                      byte && isInSelection(byte.offset) ? "selected" : ""
                    } ${byte && isSearchHighlight(byte.offset) ? "search-highlight" : ""}`}
                    onMouseDown={(e) =>
                      byte && handleByteMouseDown(byte.offset, e)
                    }
                    onMouseEnter={() =>
                      byte && handleByteMouseEnter(byte.offset)
                    }
                  >
                    {byte !== null ? toHex(byte.value, 2) : "  "}
                  </span>
                ))}
              </span>
              <span className="hex-ascii">
                {row.bytes.map((byte, i) => (
                  <span
                    key={i}
                    className={`ascii-char ${byte === null ? "empty" : ""} ${
                      byte && !isPrintable(byte.value) ? "non-printable" : ""
                    } ${byte && isInSelection(byte.offset) ? "selected" : ""} ${
                      byte && isSearchHighlight(byte.offset)
                        ? "search-highlight"
                        : ""
                    }`}
                    onMouseDown={(e) =>
                      byte && handleByteMouseDown(byte.offset, e)
                    }
                    onMouseEnter={() =>
                      byte && handleByteMouseEnter(byte.offset)
                    }
                  >
                    {byte !== null
                      ? isPrintable(byte.value)
                        ? String.fromCharCode(byte.value)
                        : "."
                      : " "}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selection info */}
      {selectionRange && (
        <div className="hex-selection-info">
          {selectionRange.start === selectionRange.end ? (
            // Single byte selected
            <>
              <span>
                Offset: 0x{toHex(selectionRange.start, offsetDigits)} (
                {selectionRange.start})
              </span>
              <span>
                Value: 0x{toHex(data[selectionRange.start], 2)} (
                {data[selectionRange.start]})
              </span>
              <span>
                Binary:{" "}
                {data[selectionRange.start].toString(2).padStart(8, "0")}
              </span>
            </>
          ) : (
            // Range selected
            <>
              <span>
                Selection: 0x{toHex(selectionRange.start, offsetDigits)} - 0x
                {toHex(selectionRange.end, offsetDigits)}
              </span>
              <span>
                Length:{" "}
                {(
                  selectionRange.end -
                  selectionRange.start +
                  1
                ).toLocaleString()}{" "}
                bytes
              </span>
              <span>
                Start: 0x{toHex(data[selectionRange.start], 2)} | End: 0x
                {toHex(data[selectionRange.end], 2)}
              </span>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .hex-viewer {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0a0a0a;
          color: #e0e0e0;
          font-family: var(--font-mono, "Consolas", "Monaco", monospace);
          font-size: 13px;
        }

        .hex-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #111;
          border-bottom: 1px solid #333;
          flex-shrink: 0;
          flex-wrap: wrap;
          gap: 8px;
        }

        .hex-info {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .hex-filename {
          color: #00ff9d;
          font-weight: 500;
        }

        .hex-size,
        .hex-rows {
          color: #888;
          font-size: 12px;
        }

        .hex-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .hex-jump,
        .hex-search {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .hex-jump input,
        .hex-search input {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 4px 8px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 12px;
        }

        .hex-jump input {
          width: 120px;
        }

        .hex-search input {
          width: 180px;
        }

        .hex-jump input:focus,
        .hex-search input:focus {
          outline: none;
          border-color: #00ff9d;
        }

        .hex-jump button,
        .hex-search button {
          background: #222;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 4px 8px;
          color: #ccc;
          cursor: pointer;
          font-size: 12px;
        }

        .hex-jump button:hover,
        .hex-search button:hover {
          background: #333;
          border-color: #00ff9d;
          color: #00ff9d;
        }

        .search-count {
          color: #888;
          font-size: 11px;
          min-width: 50px;
          text-align: center;
        }

        .hex-columns {
          display: flex;
          padding: 6px 12px;
          background: #151515;
          border-bottom: 1px solid #333;
          color: #666;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        .hex-offset-header {
          width: 80px;
          flex-shrink: 0;
        }

        .hex-bytes-header {
          flex: 1;
          letter-spacing: 1px;
        }

        .hex-ascii-header {
          width: 140px;
          flex-shrink: 0;
          text-align: center;
        }

        .hex-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .hex-content-inner {
          width: 100%;
        }

        .hex-row {
          display: flex;
          padding: 0 12px;
          line-height: ${ROW_HEIGHT}px;
          box-sizing: border-box;
        }

        .hex-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .hex-offset {
          width: 80px;
          flex-shrink: 0;
          color: #666;
        }

        .hex-bytes {
          flex: 1;
          display: flex;
          gap: 0;
        }

        .hex-byte {
          width: 24px;
          text-align: center;
          cursor: pointer;
          border-radius: 2px;
          user-select: none;
        }

        .hex-byte:hover {
          background: rgba(0, 255, 157, 0.1);
        }

        .hex-byte:active {
          background: rgba(0, 255, 157, 0.2);
        }

        .hex-byte.selected {
          background: rgba(0, 255, 157, 0.3);
          color: #00ff9d;
        }

        .hex-byte.search-highlight {
          background: rgba(255, 200, 0, 0.3);
          color: #ffc800;
        }

        .hex-byte.empty {
          color: #333;
        }

        .hex-ascii {
          width: 140px;
          flex-shrink: 0;
          display: flex;
          background: rgba(255, 255, 255, 0.02);
          border-left: 1px solid #333;
          margin-left: 8px;
          padding-left: 8px;
        }

        .ascii-char {
          width: 8px;
          text-align: center;
          cursor: pointer;
          user-select: none;
        }

        .ascii-char:hover {
          background: rgba(0, 255, 157, 0.1);
        }

        .ascii-char:active {
          background: rgba(0, 255, 157, 0.2);
        }

        .ascii-char.selected {
          background: rgba(0, 255, 157, 0.3);
          color: #00ff9d;
        }

        .ascii-char.search-highlight {
          background: rgba(255, 200, 0, 0.3);
          color: #ffc800;
        }

        .ascii-char.non-printable {
          color: #444;
        }

        .hex-selection-info {
          display: flex;
          gap: 24px;
          padding: 8px 12px;
          background: #111;
          border-top: 1px solid #333;
          font-size: 12px;
          color: #888;
          flex-shrink: 0;
        }

        .hex-selection-info span {
          display: flex;
          gap: 4px;
        }

        /* Scrollbar styling */
        .hex-content::-webkit-scrollbar {
          width: 8px;
        }

        .hex-content::-webkit-scrollbar-track {
          background: #111;
        }

        .hex-content::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }

        .hex-content::-webkit-scrollbar-thumb:hover {
          background: #00ff9d;
        }
      `}</style>
    </div>
  );
}

// Helper function to detect if content is binary
export function isBinaryContent(
  content: string | Uint8Array,
  filename?: string,
): boolean {
  // Check file extension first
  if (filename) {
    const binaryExtensions = [
      ".elf",
      ".bin",
      ".o",
      ".a",
      ".so",
      ".dll",
      ".exe",
      ".hex",
      ".img",
      ".rom",
    ];
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    if (binaryExtensions.includes(ext)) {
      return true;
    }
  }

  // For Uint8Array, check for null bytes or high percentage of non-printable chars
  if (content instanceof Uint8Array) {
    const sampleSize = Math.min(1024, content.length);
    let nonPrintable = 0;

    for (let i = 0; i < sampleSize; i++) {
      const byte = content[i];
      // Check for null bytes (strong indicator of binary)
      if (byte === 0) return true;
      // Count non-printable, non-whitespace characters
      if (byte < 0x09 || (byte > 0x0d && byte < 0x20) || byte > 0x7e) {
        nonPrintable++;
      }
    }

    // If more than 10% non-printable, consider it binary
    return nonPrintable / sampleSize > 0.1;
  }

  // For strings, check for null characters
  if (typeof content === "string") {
    return content.includes("\0");
  }

  return false;
}
