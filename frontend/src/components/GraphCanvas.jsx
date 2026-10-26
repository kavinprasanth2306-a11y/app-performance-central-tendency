import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Network } from 'vis-network';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Play, 
  Pause, 
  RotateCcw, 
  MousePointerClick,
  Sparkles,
  Info
} from 'lucide-react';

export default function GraphCanvas({
  nodes,
  edges,
  selectedNodeA,
  selectedNodeB,
  commonNeighbors = [],
  onSelectNodeA,
  onSelectNodeB,
  onClearSelection
}) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [isPhysicsActive, setIsPhysicsActive] = useState(true);

  // Compute node degrees for dynamic node sizing
  const nodeDegrees = useMemo(() => {
    const degMap = {};
    nodes.forEach(n => degMap[n.id] = 0);
    edges.forEach(e => {
      const u = typeof e === 'object' ? (e.source || e[0]) : e[0];
      const v = typeof e === 'object' ? (e.target || e[1]) : e[1];
      if (u !== undefined && degMap[u] !== undefined) degMap[u]++;
      if (v !== undefined && degMap[v] !== undefined) degMap[v]++;
    });
    return degMap;
  }, [nodes, edges]);

  // Construct Vis-network dataset with custom neon glassmorphism styling
  useEffect(() => {
    if (!containerRef.current || !nodes.length) return;

    const commonSet = new Set(commonNeighbors || []);

    const visNodes = nodes.map(n => {
      const isA = n.id === selectedNodeA;
      const isB = n.id === selectedNodeB;
      const isCommon = commonSet.has(n.id);
      const degree = nodeDegrees[n.id] || 1;
      const baseSize = Math.max(14, Math.min(32, 12 + degree * 2));

      let bg = '#1e293b'; // slate-800
      let border = '#38bdf8'; // cyan-400
      let size = baseSize;
      let fontColor = '#e2e8f0';

      if (isA) {
        bg = '#0284c7'; // vibrant sky blue
        border = '#38bdf8';
        size = baseSize + 10;
        fontColor = '#38bdf8';
      } else if (isB) {
        bg = '#9333ea'; // vibrant purple
        border = '#c084fc';
        size = baseSize + 10;
        fontColor = '#c084fc';
      } else if (isCommon) {
        bg = '#059669'; // emerald-600
        border = '#34d399';
        size = baseSize + 6;
        fontColor = '#34d399';
      }

      return {
        id: n.id,
        label: n.label || n.id,
        size: size,
        color: {
          background: bg,
          border: border,
          highlight: {
            background: isA ? '#0ea5e9' : isB ? '#a855f7' : isCommon ? '#10b981' : '#38bdf8',
            border: '#ffffff'
          },
          hover: {
            background: isA ? '#0ea5e9' : isB ? '#a855f7' : isCommon ? '#10b981' : '#38bdf8',
            border: '#ffffff'
          }
        },
        borderWidth: isA || isB ? 3 : isCommon ? 2.5 : 1.5,
        shadow: {
          enabled: true,
          color: isA ? 'rgba(56, 189, 248, 0.7)' : isB ? 'rgba(192, 132, 252, 0.7)' : isCommon ? 'rgba(52, 211, 153, 0.6)' : 'rgba(0, 0, 0, 0.5)',
          size: isA || isB || isCommon ? 18 : 8,
          x: 0,
          y: 0
        },
        font: {
          color: fontColor,
          size: isA || isB ? 14 : 12,
          face: 'Inter',
          strokeWidth: 2,
          strokeColor: '#0b0f19'
        }
      };
    });

    const visEdges = edges.map((e, idx) => {
      const u = typeof e === 'object' ? (e.source || e[0]) : e[0];
      const v = typeof e === 'object' ? (e.target || e[1]) : e[1];
      
      const isIncidentA = u === selectedNodeA || v === selectedNodeA;
      const isIncidentB = u === selectedNodeB || v === selectedNodeB;
      const isConnectingPair = (u === selectedNodeA && v === selectedNodeB) || (u === selectedNodeB && v === selectedNodeA);

      let edgeColor = 'rgba(255, 255, 255, 0.15)';
      let edgeWidth = 1.2;
      let dashes = false;

      if (isConnectingPair) {
        edgeColor = '#38bdf8';
        edgeWidth = 3.5;
      } else if (isIncidentA) {
        edgeColor = 'rgba(56, 189, 248, 0.6)';
        edgeWidth = 2.2;
      } else if (isIncidentB) {
        edgeColor = 'rgba(192, 132, 252, 0.6)';
        edgeWidth = 2.2;
      }

      return {
        id: `e-${idx}`,
        from: u,
        to: v,
        color: {
          color: edgeColor,
          highlight: '#38bdf8',
          hover: '#67e8f9'
        },
        width: edgeWidth,
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.2
        }
      };
    });

    const data = {
      nodes: visNodes,
      edges: visEdges
    };

    const options = {
      nodes: {
        shape: 'dot',
      },
      edges: {
        arrows: { to: { enabled: false } },
        selectionWidth: 2.5
      },
      physics: {
        enabled: isPhysicsActive,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -40,
          centralGravity: 0.015,
          springLength: 80,
          springConstant: 0.08,
          damping: 0.4,
          avoidOverlap: 0.5
        },
        stabilization: {
          enabled: true,
          iterations: 150,
          updateInterval: 25
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 150,
        multiselect: false,
        navigationButtons: false,
        zoomView: true
      }
    };

    // Initialize network
    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    // Handle node click event
    network.on('click', (params) => {
      if (params.nodes && params.nodes.length > 0) {
        const clickedNodeId = params.nodes[0];
        
        if (!selectedNodeA) {
          onSelectNodeA(clickedNodeId);
        } else if (selectedNodeA === clickedNodeId) {
          // Deselect node A
          onClearSelection();
        } else if (!selectedNodeB) {
          onSelectNodeB(clickedNodeId);
        } else if (selectedNodeB === clickedNodeId) {
          // Deselect node B
          onSelectNodeB(null);
        } else {
          // Both were already selected; replace Node A with new click and clear Node B
          onSelectNodeA(clickedNodeId);
          onSelectNodeB(null);
        }
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges, selectedNodeA, selectedNodeB, commonNeighbors, isPhysicsActive]);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.3, animation: { duration: 300 } });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 0.7, animation: { duration: 300 } });
    }
  };

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
    }
  };

  const togglePhysics = () => {
    setIsPhysicsActive(!isPhysicsActive);
    if (networkRef.current) {
      networkRef.current.setOptions({ physics: { enabled: !isPhysicsActive } });
    }
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[620px] rounded-2xl glass-panel overflow-hidden border border-white/10 flex flex-col shadow-2xl">
      
      {/* Top Interactive Node Pair Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-white/10 bg-slate-900/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interactive Prediction Pair
          </span>
        </div>

        {/* Selected Pair Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Node A Selector Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-950/70 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30"></span>
            <span className="text-slate-400">Node A:</span>
            <span className="font-semibold text-cyan-300 max-w-[110px] truncate">
              {selectedNodeA || 'Click node...'}
            </span>
          </div>

          <span className="text-slate-500 font-bold">⇄</span>

          {/* Node B Selector Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/70 border border-purple-500/40 shadow-sm shadow-purple-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-2 ring-purple-400/30"></span>
            <span className="text-slate-400">Node B:</span>
            <span className="font-semibold text-purple-300 max-w-[110px] truncate">
              {selectedNodeB || 'Click node...'}
            </span>
          </div>

          {/* Common Neighbors Count Badge */}
          {commonNeighbors && commonNeighbors.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{commonNeighbors.length} Common Neighbors</span>
            </div>
          )}

          {(selectedNodeA || selectedNodeB) && (
            <button
              onClick={onClearSelection}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              title="Clear selected node pair"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Floating Canvas Controls Toolbar */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1.5 p-1.5 rounded-xl glass-panel bg-slate-900/80 border border-white/15 shadow-xl">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Fit Graph to Viewport"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-white/15 mx-0.5" />
        <button
          onClick={togglePhysics}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isPhysicsActive 
              ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          title={isPhysicsActive ? "Pause Physics Simulation" : "Resume Physics Simulation"}
        >
          {isPhysicsActive ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPhysicsActive ? 'Physics On' : 'Frozen'}</span>
        </button>
      </div>

      {/* Floating Tip Banner */}
      {(!selectedNodeA || !selectedNodeB) && (
        <div className="absolute top-16 left-5 z-20 pointer-events-none flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/25 text-slate-300 text-xs shadow-lg backdrop-blur-md animate-fade-in">
          <MousePointerClick className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span>
            {!selectedNodeA 
              ? "Click any node to select Target Node A" 
              : `Node A (${selectedNodeA}) selected. Click another node for Node B`}
          </span>
        </div>
      )}

      {/* Legend Ribbon at Bottom Left */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-3 px-3.5 py-2 rounded-xl glass-panel bg-slate-900/70 text-[11px] text-slate-400 border border-white/10 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30"></span>
          <span>Node A</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-2 ring-purple-400/30"></span>
          <span>Node B</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30"></span>
          <span>Common Neighbor</span>
        </div>
      </div>

      {/* Vis Network Target Container */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
