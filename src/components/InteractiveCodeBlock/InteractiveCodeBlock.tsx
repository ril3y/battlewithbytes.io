"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './InteractiveCodeBlock.module.css';
import Prism from 'prismjs';
// Import Prism's line numbers plugin
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
// Import line numbers styling
import './prism-line-numbers.css';
// Import Prism's themes and languages (these should already be imported in your project via CodeBlock)

export interface Highlight {
  value: string;
  color?: string;
  tooltip: string;
}

interface InteractiveCodeBlockProps {
  code?: string;         // Code can be optional if githubUrl is provided
  highlights?: Highlight[];
  language?: string;
  githubUrl?: string;    // GitHub URL to fetch code from (can be normal or raw URL)
  startLine?: number;    // Start line to display (0-indexed)
  endLine?: number;      // End line to display (0-indexed), inclusive
  showLineNumbers?: boolean; // Whether to show line numbers
}

const InteractiveCodeBlock: React.FC<InteractiveCodeBlockProps> = ({ 
  code = '', 
  highlights = [],
  language = 'bash',
  githubUrl,
  startLine,
  endLine,
  showLineNumbers = false
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [codeContent, setCodeContent] = useState<string>(code);
  const [isLoading, setIsLoading] = useState<boolean>(!!githubUrl);
  const [error, setError] = useState<string | null>(null);
  const [effectiveStartLine, setEffectiveStartLine] = useState<number | undefined>(startLine);
  const [effectiveEndLine, setEffectiveEndLine] = useState<number | undefined>(endLine);
  const [copySupported, setCopySupported] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const codeRef = useRef<HTMLElement>(null);
  
  // Check if clipboard API is supported
  useEffect(() => {
    setCopySupported(!!navigator?.clipboard);
  }, []);
  
  // Apply Prism.js highlighting once code is loaded and rendered
  useEffect(() => {
    if (codeRef.current && !isLoading && !error) {
      // Need to wait a bit for the DOM to be updated with the code content
      setTimeout(() => {
        if (codeRef.current) {
          Prism.highlightElement(codeRef.current);
        }
      }, 0);
    }
  }, [codeContent, isLoading, error, language]);
  
  // Convert GitHub URL to raw URL if needed
  const getRawGitHubUrl = (url: string): string => {
    // Check if it's already a raw URL
    if (url.includes('raw.githubusercontent.com')) {
      return url;
    }
    
    // Convert regular GitHub URL to raw URL
    // Format: https://github.com/{owner}/{repo}/blob/{branch}/{path} -> https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
    try {
      const githubRegex = /https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.*)/;
      const match = url.match(githubRegex);
      
      if (match) {
        const [_, owner, repo, branch, path] = match;
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      }
      
      return url; // Return original if we can't parse it
    } catch (e) {
      console.error('Error converting GitHub URL:', e);
      return url;
    }
  };
  
  // Extract line numbers from URL if present
  const extractLineInfo = (url: string): { url: string, extractedStartLine?: number, extractedEndLine?: number } => {
    // Handle GitHub line anchors like #L10-L20
    const lineAnchorRegex = /#L(\d+)(?:-L(\d+))?$/;
    const match = url.match(lineAnchorRegex);
    
    if (match) {
      const extractedStartLine = parseInt(match[1]) - 1; // Convert to 0-indexed
      const extractedEndLine = match[2] ? parseInt(match[2]) - 1 : extractedStartLine;
      const cleanUrl = url.replace(lineAnchorRegex, '');
      
      return { url: cleanUrl, extractedStartLine, extractedEndLine };
    }
    
    return { url };
  };

  // Fetch code from GitHub if URL is provided
  useEffect(() => {
    if (!githubUrl) return;
    
    const fetchCode = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Process the URL to extract line information and convert to raw if needed
        const { url: cleanUrl, extractedStartLine, extractedEndLine } = extractLineInfo(githubUrl);
        const rawUrl = getRawGitHubUrl(cleanUrl);
        
        const response = await fetch(rawUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch code: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.text();
        setCodeContent(data);
        
        // Update start and end lines if they were in the URL and not explicitly provided
        if (extractedStartLine !== undefined && startLine === undefined) {
          setEffectiveStartLine(extractedStartLine);
        }
        
        if (extractedEndLine !== undefined && endLine === undefined) {
          setEffectiveEndLine(extractedEndLine);
        }
      } catch (err) {
        console.error('Error fetching code from GitHub:', err);
        setError(`Failed to load code from ${githubUrl}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCode();
  }, [githubUrl, startLine, endLine]);
  
  // Get the filtered code content based on start/end lines
  const getFilteredContent = () => {
    // First check if we have content
    if (!codeContent.trim()) {
      return '';
    }
    
    // Split the code into lines
    const allLines = codeContent.split('\n');
    
    // Apply line range filtering if specified
    const start = effectiveStartLine !== undefined ? effectiveStartLine : 0;
    const end = effectiveEndLine !== undefined ? effectiveEndLine : allLines.length - 1;
    
    // Validate range - make sure we don't go out of bounds
    const validStart = Math.max(0, Math.min(start, allLines.length - 1));
    const validEnd = Math.max(validStart, Math.min(end, allLines.length - 1));
    
    // Get the lines we want to display
    const filteredLines = allLines.slice(validStart, validEnd + 1);

    // If line numbers are enabled, prepare for Prism.js line numbers class
    if (showLineNumbers) {
      return filteredLines.join('\n');
    } else {
      return filteredLines.join('\n');
    }
  };
  
  // Info about the line range being displayed
  const getLineRangeInfo = () => {
    if (!codeContent.trim()) return null;
    
    const allLines = codeContent.split('\n');
    const start = effectiveStartLine !== undefined ? effectiveStartLine : 0;
    const end = effectiveEndLine !== undefined ? effectiveEndLine : allLines.length - 1;
    
    // Validate range
    const validStart = Math.max(0, Math.min(start, allLines.length - 1));
    const validEnd = Math.max(validStart, Math.min(end, allLines.length - 1));
    
    // Only show info if we're displaying a subset of the file
    if (showLineNumbers && (validStart > 0 || validEnd < allLines.length - 1)) {
      return {
        start: validStart + 1, // 1-indexed for display
        end: validEnd + 1,    // 1-indexed for display
        total: allLines.length
      };
    }
    
    return null;
  };
  
  // Process highlights
  const processHighlights = (text: string) => {
    if (!highlights?.length) return text;
    
    let processedText = text;
    highlights
      .filter(h => h && h.value)
      .sort((a, b) => b.value.length - a.value.length)
      .forEach(highlight => {
        const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const value = escapeRegExp(highlight.value);
        
        // Match the value with surrounding non-word characters or at line boundaries
        const regex = new RegExp(`(^|[^\\w])(${value})([^\\w]|$)`, 'g');
        
        // This is simplified - we would need more complex logic to actually highlight in React
        // Instead, we'll rely on Prism.js for syntax highlighting and just add our own custom
        // highlighting via mouse interaction
      });
    
    return processedText;
  };

  // Handle showing tooltip when a highlighted word is hovered or focused
  const handleMouseOver = (e: React.MouseEvent<HTMLPreElement>) => {
    const target = e.target as HTMLElement;
    if (target.hasAttribute('data-highlight')) {
      const value = target.getAttribute('data-highlight');
      const highlight = highlights.find(h => h.value === value);
      
      if (highlight) {
        const rect = target.getBoundingClientRect();
        const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        
        // Calculate position to show tooltip much higher above the highlighted text
        // Move it up approximately 2 rows (using line-height estimate)
        const lineHeight = 24; // Estimated line height
        setTooltipPosition({
          top: rect.top - containerRect.top - 120, // Position 2 rows higher (80 + 2*20)
          left: rect.left - containerRect.left + (rect.width / 2)
        });
        
        setActiveTooltip(highlight.tooltip);
      }
    }
  };
  
  // Get filtered code and line range info
  const filteredCode = !isLoading && !error ? getFilteredContent() : '';
  const lineRangeInfo = getLineRangeInfo();
  
  // Trigger syntax highlighting after render
  useEffect(() => {
    if (codeRef.current && filteredCode) {
      Prism.highlightElement(codeRef.current);
    }
  }, [filteredCode]);

  // Handle highlighting when hovering over specific code elements
  const handleHighlightHover = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    
    // Check if we're hovering over an element that matches one of our highlights
    if (highlights && highlights.length > 0) {
      // Get the text content of the element we're hovering over
      const textContent = target.textContent || '';
      
      // Find if any of our highlights match this text
      const matchingHighlight = highlights.find(h => {
        // Make sure the highlight and its value property exist
        if (!h || typeof h.value !== 'string') return false;
        
        // Now it's safe to do the includes checks
        return textContent.includes(h.value) || h.value.includes(textContent);
      });
      
      if (matchingHighlight && matchingHighlight.tooltip) {
        const rect = target.getBoundingClientRect();
        const containerRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        
        setTooltipPosition({
          top: rect.top - containerRect.top - 40,
          left: rect.left - containerRect.left + (rect.width / 2)
        });
        
        setActiveTooltip(matchingHighlight.tooltip);
      }
    }
  };
  
  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loading}>
          <span>Loading code...</span>
        </div>
      )}
      
      {error && (
        <div className={styles.error}>
          <span>{error}</span>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className={styles.codeWrapper}>
          {/* Line range info banner */}
          {lineRangeInfo && (
            <div className={styles.fileInfo}>
              // Showing lines {lineRangeInfo.start}-{lineRangeInfo.end} of {lineRangeInfo.total} total lines
            </div>
          )}
          
          {/* Copy button */}
          {copySupported && (
            <button 
              className={`${styles.copyButton} ${copySuccess ? styles.copySuccess : ''}`}
              onClick={() => {
                try {
                  navigator.clipboard.writeText(filteredCode)
                    .then(() => {
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    })
                    .catch(err => {
                      console.error('Failed to copy: ', err);
                      setCopySuccess(false);
                    });
                } catch (err) {
                  console.error('Clipboard error:', err);
                }
              }}
            >
              {copySuccess ? '✓ Copied!' : 'Copy'}
            </button>
          )}
          
          {/* Code block with syntax highlighting */}
          <pre 
            className={`${styles.codeBlock} language-${language} prism-code bg-gray-900 p-4 rounded-md overflow-x-auto font-mono text-sm ${showLineNumbers ? 'line-numbers' : ''}`}
            onMouseOver={handleHighlightHover}
            onMouseOut={() => setActiveTooltip(null)}
            data-start={lineRangeInfo?.start || 1}
            style={{
              counterReset: `linenumber ${(lineRangeInfo?.start || 1) - 1}`
            }}
          >
            <code 
              ref={codeRef}
              className={`language-${language}`}
            >
              {filteredCode}
            </code>
          </pre>
        </div>
      )}
      
      {activeTooltip && (
        <div 
          className={styles.tooltip}
          style={{ 
            top: `${tooltipPosition.top}px`, 
            left: `${tooltipPosition.left}px` 
          }}
        >
          {activeTooltip}
          <div className={styles.tooltipArrow}></div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCodeBlock;
