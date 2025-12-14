"use client";

import React, { useState } from "react";
import { useWireMapperStore } from "../store/useWireMapperStore";
import { cleanPinName } from "../utils/formatPinName";

export const TableView: React.FC = () => {
  const { connectors, mappings, updatePin } = useWireMapperStore();
  const [editingPin, setEditingPin] = useState<{
    connectorId: string;
    pinPos: number;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const justStartedEditingRef = React.useRef(false);

  const getConnectorName = (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);
    return connector ? connector.name : "Unknown Connector";
  };

  const handleStartEdit = (
    connectorId: string,
    pinPos: number,
    currentName: string,
  ) => {
    justStartedEditingRef.current = true;
    setEditingPin({ connectorId, pinPos });
    setEditValue(currentName);
    // Clear the flag after a short delay
    setTimeout(() => {
      justStartedEditingRef.current = false;
    }, 100);
  };

  const handleSaveEdit = () => {
    if (editingPin && editValue.trim()) {
      updatePin(editingPin.connectorId, editingPin.pinPos, {
        name: editValue.trim(),
      });
    }
    setEditingPin(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingPin(null);
    setEditValue("");
  };

  const handleBlur = () => {
    // Don't process blur if we just started editing (prevents immediate blur)
    if (justStartedEditingRef.current) {
      return;
    }
    // Blur should save the changes
    handleSaveEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const renderEditablePin = (connectorId: string, pinPos: number) => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (!connector)
      return <span className="text-red-400">Invalid Connector</span>;

    const pin = connector.pins.find((p) => p.pos === pinPos);
    if (!pin) return <span className="text-red-400">Pin {pinPos} (N/F)</span>;

    const isEditing =
      editingPin?.connectorId === connectorId && editingPin?.pinPos === pinPos;
    const displayName = cleanPinName(pin.name || `Pin ${pinPos}`);

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="bg-gray-700 text-white px-2 py-1 rounded text-xs font-mono border border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-full"
        />
      );
    }

    return (
      <span
        onClick={() => handleStartEdit(connectorId, pinPos, displayName)}
        className="cursor-pointer hover:text-cyan-400 hover:underline transition-colors"
      >
        {displayName}{" "}
        <span className="text-gray-600 text-xs">(Pos: {pinPos})</span>
      </span>
    );
  };

  if (connectors.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 h-full flex items-center justify-center">
        No connectors to display.
      </div>
    );
  }

  if (mappings.length === 0 && connectors.length > 0) {
    return (
      <div className="p-6 text-center text-gray-500 h-full flex items-center justify-center">
        No connections made yet.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-4 h-full space-y-8 bg-gray-950">
      {connectors.map((connector) => {
        const relevantMappings = mappings.filter(
          (m) =>
            m.source.connectorId === connector.id ||
            m.target.connectorId === connector.id,
        );

        return (
          <div key={connector.id}>
            <h3 className="text-xl font-semibold text-green-400 mb-3 sticky top-0 bg-gray-950 py-2 z-10 border-b border-gray-800">
              {connector.name || `Connector ${connector.id.substring(0, 6)}...`}{" "}
              Connections
            </h3>
            {relevantMappings.length === 0 ? (
              <p className="text-gray-500 text-sm pl-2 italic">
                No connections for this connector.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-300 bg-gray-900 rounded-lg">
                  <thead className="text-xs uppercase bg-gray-800">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 w-12">Color</th>
                      <th className="px-2 sm:px-4 py-3">Own Pin</th>
                      <th className="px-2 sm:px-4 py-3">
                        Connected To (Connector)
                      </th>
                      <th className="px-2 sm:px-4 py-3">Connected To (Pin)</th>
                      <th className="px-2 sm:px-4 py-3">Net Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {relevantMappings.map((mapping) => {
                      const isSourceLocal =
                        mapping.source.connectorId === connector.id;
                      const localPinPos = isSourceLocal
                        ? mapping.source.pinPos
                        : mapping.target.pinPos;
                      const remoteConnectorId = isSourceLocal
                        ? mapping.target.connectorId
                        : mapping.source.connectorId;
                      const remotePinPos = isSourceLocal
                        ? mapping.target.pinPos
                        : mapping.source.pinPos;

                      return (
                        <tr
                          key={mapping.id}
                          className="hover:bg-gray-850 transition-colors duration-150"
                        >
                          <td className="px-2 sm:px-4 py-3">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-600"
                              style={{
                                backgroundColor: mapping.color || "transparent",
                              }}
                              title={`Wire color: ${mapping.color || "Default"}`}
                            />
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-gray-400 font-mono text-xs">
                            {renderEditablePin(connector.id, localPinPos)}
                          </td>
                          <td className="px-2 sm:px-4 py-3 font-mono text-xs">
                            {getConnectorName(remoteConnectorId)}
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-gray-400 font-mono text-xs">
                            {renderEditablePin(remoteConnectorId, remotePinPos)}
                          </td>
                          <td className="px-2 sm:px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${mapping.netName ? "bg-gray-700 text-gray-200" : "text-gray-500"}`}
                            >
                              {mapping.netName || "--"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
