import React from 'react';
import type { Block, Wire } from './core/types';
import type { InlineEditState } from './wires/hooks/useInlineEditing';

interface InlineEditorsProps {
  // Consolidated editing state
  editState: InlineEditState;
  updateLabel: (label: string) => void;
  saveLabel: () => void;
  stopEditing: () => void;

  // Data needed for rendering
  wires: Wire[];
  blocks: Block[];
  getWireEndpointPosition: (wire: Wire, isFrom: boolean) => { x: number; y: number };

  // SVG refs for coordinate transformation
  svgRef: React.RefObject<SVGSVGElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function InlineEditors(props: InlineEditorsProps) {
  const {
    editState,
    updateLabel,
    saveLabel,
    stopEditing,
    wires,
    blocks,
    getWireEndpointPosition,
    svgRef,
    containerRef
  } = props;

  return (
    <>
      {/* Inline Editor for Wire Label */}
      {editState.type === 'wire' && (() => {
        const wire = wires.find(w => w.id === editState.wireId);
        if (!wire) return null;
        const from = getWireEndpointPosition(wire, true);
        const to = getWireEndpointPosition(wire, false);
        const allPoints: Array<{ x: number; y: number }> = [from, ...wire.bendPoints, to];
        const midIdx = Math.floor(allPoints.length / 2);
        const labelPos = allPoints[midIdx];
        if (!svgRef.current || !containerRef.current) return null;
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = labelPos.x;
        pt.y = labelPos.y - 8;
        const screenPt = pt.matrixTransform(svg.getScreenCTM()!);
        const containerRect = containerRef.current.getBoundingClientRect();

        // Autocomplete Logic
        const query = editState.label.toLowerCase();
        // Get all unique net names/labels from existing wires
        const existingNames = Array.from(new Set(
          wires
            .flatMap(w => [w.label, w.netName])
            .filter(name => name && name !== 'Wire' && !name.startsWith('Unnamed Bus'))
        )).sort();

        const suggestions = existingNames.filter(name =>
          name.toLowerCase().includes(query) && name !== editState.label
        ).slice(0, 5); // Limit to 5 suggestions

        const handleSuggestionClick = (name: string) => {
          updateLabel(name);
          // We need to defer saving slightly to allow the update to process? 
          // actually updateLabel just updates state. We want to commit it.
          // Ideally we update the label THEN save. 
          // Since updateLabel is async in react state terms, we might need a workaround or pass a "commit" flag.
          // However, updateLabel touches the store? No, editState is local to the hook usually.
          // Let's assume updateLabel updates the input value.
          // We can just call saveLabel with the NEW value if saveLabel supported args, but it uses state.
          // For now, let's just update and let user hit enter, or use a timeout?
          // Better pattern: updateLabel(name); setTimeout(saveLabel, 0); 
          // BUT saveLabel reads from editStateRef usually or passed prop.
          // If `saveLabel` relies on `editState.label` from props, we need to wait for re-render.
          // Let's just update for now and let user hit enter, or try to force it.
          // Actually, standard behavior is clicking fills it in, then you hit enter or click away.
          updateLabel(name);
          // Keep focus on input?
          // If we want immediate save on click:
          // saveLabel(); <--- this might save the OLD value if state hasn't flushed.
          // Safest is just fill it in.
        };

        return (
          <div style={{
            position: 'absolute',
            left: screenPt.x - containerRect.left - 50,
            top: screenPt.y - containerRect.top - 12,
            zIndex: 10000
          }}>
            <input
              type="text"
              value={editState.label}
              onChange={(e) => updateLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveLabel();
                if (e.key === 'Escape') stopEditing();
                if (e.key === 'Tab' && suggestions.length > 0) {
                  e.preventDefault();
                  updateLabel(suggestions[0]);
                }
              }}
              onBlur={() => {
                // Delay save slightly so suggestion click can register
                setTimeout(saveLabel, 150);
              }}
              autoFocus
              style={{
                width: '100px',
                padding: '2px 4px',
                fontSize: '10px',
                fontFamily: 'monospace',
                background: 'rgba(0, 170, 255, 0.9)',
                color: '#fff',
                border: '1px solid #00aaff',
                borderRadius: '3px',
                outline: 'none',
              }}
            />
            {suggestions.length > 0 && (
              <div style={{
                marginTop: '2px',
                background: '#1a1a1a',
                border: '1px solid #00ffa0',
                borderRadius: '3px',
                maxHeight: '100px',
                overflowY: 'auto'
              }}>
                {suggestions.map(name => (
                  <div
                    key={name}
                    onClick={() => handleSuggestionClick(name)}
                    style={{
                      padding: '4px',
                      fontSize: '10px',
                      color: '#eee',
                      cursor: 'pointer',
                      borderBottom: '1px solid #333'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Inline Editor for Connection Point Label */}
      {editState.type === 'connection' && (() => {
        const block = blocks.find(b => b.id === editState.blockId);
        const point = block?.connectionPoints.find(p => p.id === editState.pointId);
        if (!block || !point) return null;
        if (!svgRef.current || !containerRef.current) return null;
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = block.x + point.x;
        pt.y = block.y + point.y + 4;
        const screenPt = pt.matrixTransform(svg.getScreenCTM()!);
        const containerRect = containerRef.current.getBoundingClientRect();
        return (
          <input
            type="text"
            value={editState.label}
            onChange={(e) => updateLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveLabel();
              if (e.key === 'Escape') stopEditing();
            }}
            onBlur={saveLabel}
            autoFocus
            style={{
              position: 'absolute',
              left: screenPt.x - containerRect.left - 30,
              top: screenPt.y - containerRect.top,
              width: '60px',
              padding: '2px 4px',
              fontSize: '9px',
              fontFamily: 'monospace',
              background: 'rgba(170, 170, 170, 0.95)',
              color: '#000',
              border: '1px solid #aaa',
              borderRadius: '3px',
              outline: 'none',
              zIndex: 10000
            }}
          />
        );
      })()}

      {/* Inline Editor for Block Label */}
      {editState.type === 'block' && (() => {
        const block = blocks.find(b => b.id === editState.blockId);
        if (!block) return null;
        if (!svgRef.current || !containerRef.current) return null;
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        // Anchor on the label's actual painted position (with offsets) so the
        // input appears where the user double-clicked, not at block center.
        pt.x = block.x + block.width / 2 + (block.labelOffsetX || 0);
        pt.y = block.y + block.height / 2 + 7 + (block.labelOffsetY || 0);
        const screenPt = pt.matrixTransform(svg.getScreenCTM()!);
        const containerRect = containerRef.current.getBoundingClientRect();
        return (
          <input
            type="text"
            value={editState.label}
            onChange={(e) => updateLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveLabel();
              if (e.key === 'Escape') stopEditing();
            }}
            onBlur={saveLabel}
            autoFocus
            style={{
              position: 'absolute',
              left: screenPt.x - containerRect.left - 60,
              top: screenPt.y - containerRect.top - 10,
              width: '120px',
              padding: '3px 6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#000',
              border: '2px solid #00ffa0',
              borderRadius: '4px',
              outline: 'none',
              textAlign: 'center',
              zIndex: 10000
            }}
          />
        );
      })()}
    </>
  );
}
