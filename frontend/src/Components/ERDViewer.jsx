import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import Toolbar from "./Toolbar";
import TableCard from "./TableCard";
import { getRelationType } from "../../helper";

const ERDViewer = ({ schema }) => {
  const [filter, setFilter] = useState("all");
  const [showIcons, setShowIcons] = useState(true);
  const [showRelations, setShowRelations] = useState(true);
  const [showRelationType, setShowRelationType] = useState(false); // ✅ NEW toggle

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [highlighted, setHighlighted] = useState({ pk: null, fk: null });

  useEffect(() => {
    if (!schema?.tables) return;

    // ---- Nodes ----
    const newNodes = schema.tables.map((table, index) => ({
      id: table.name,
      position: { x: index * 300, y: index * 120 },
      data: { 
        label: <TableCard 
                 table={table} 
                 filter={filter} 
                 showIcons={showIcons} 
                 highlighted={highlighted} 
               /> 
      },
      draggable: true,
      style: {
        background: "white",
        borderRadius: "12px",
        padding: "8px",
        width: 250,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      },
    }));

    // ---- Edges ----
    let newEdges = [];
    if (showRelations && schema.relationships) {
      schema.relationships.forEach((rel, idx) => {
        const relationType = rel.multiplicity || "1:N"; 
        let dashArray = relationType.includes("1..1") ? "0" : "4 2";

        newEdges.push({
          id: `rel-${idx}`,
          source: rel.from,
          target: rel.to,
          type: "straight",
          markerEnd: { type: "arrowclosed", color: "#555" },
          style: { stroke: "#555", strokeWidth: 2, strokeDasharray: dashArray },
          // ✅ show relation type if toggle is enabled
          label: showRelationType 
            ? getRelationType(rel.multiplicity)
            : `${rel.constraint}`,
          labelStyle: { fontSize: 12, fill: "#333" },
        });
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [schema, filter, showIcons, showRelations, showRelationType, highlighted]);

  const onEdgeClick = useCallback(
    (event, edge) => {
      const constraint = edge.label;
      console.log("Clicked relation:", constraint);
    },
    []
  );

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Toolbar
        filter={filter}
        setFilter={setFilter}
        showIcons={showIcons}
        setShowIcons={setShowIcons}
        showRelations={showRelations}
        setShowRelations={setShowRelations}
        showRelationType={showRelationType}            // ✅ pass toggle
        setShowRelationType={setShowRelationType}      // ✅ pass setter
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        zoomOnScroll
        zoomOnPinch
        panOnDrag
        minZoom={0.2}
        maxZoom={2}
        onEdgeClick={onEdgeClick}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default ERDViewer;
