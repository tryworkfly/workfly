"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  BackgroundVariant,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
  OnNodeDrag,
  OnConnect,
  Connection,
  SelectionMode,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import type { ActionNode } from "@/components/nodes/ActionNode";
import type { JobNode } from "@/components/nodes/JobNode";
import nodeTypes from "./nodeTypes";
import Sidebar from "@/components/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopPanel from "@/components/TopPanel";
import { WorkflowAIResponse } from "../../types/ai";
import { generateId } from "@/lib/utils";
import { DragNDropProvider, useDragAndDrop } from "@/lib/DragNDropContext";
import { toast } from "sonner";
import useStepDefinitions from "@/hooks/useSteps";

const initialNodes: Node[] = [
  {
    id: "trigger",
    type: "triggerNode",
    position: { x: 500, y: 300 },
    data: { trigger: "push" },
    deletable: false,
  },
];

const initialEdges: Edge[] = [];

export default function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <ReactFlowProvider>
        <DragNDropProvider>
          <Playground />
        </DragNDropProvider>
      </ReactFlowProvider>
    </TooltipProvider>
  );
}

function Playground() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectStartPos, setSelectStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [droppedType, _] = useDragAndDrop();
  const { stepDefinitions } = useStepDefinitions();

  const {
    getIntersectingNodes,
    getNode,
    updateNodeData,
    screenToFlowPosition,
  } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      updateNodeData(params.source, { error: false });
    },
    [setEdges, updateNodeData]
  );

  const onSelectionStart = useCallback(
    (e: React.MouseEvent) => {
      setSelectStartPos(screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [setSelectStartPos]
  );

  const onSelectionEnd = useCallback(
    (e: React.MouseEvent) => {
      if (selectStartPos === null) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      console.log(
        `Width: ${Math.abs(pos.x - selectStartPos?.x)}      Height: ${Math.abs(
          pos.y - selectStartPos?.y
        )}`
      );
    },
    [setSelectStartPos]
  );

  const onNodeDrag: OnNodeDrag = useCallback((event, node) => {
    if (node.type === "jobNode") return;
    const intersectingNodes = getIntersectingNodes(node).filter(
      (n) => n.type === "jobNode"
    );
    if (intersectingNodes.length === 0) return;
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === node.id)
          return {
            ...n,
            parentId: intersectingNodes[0].id,
            extent: "parent",
            expandParent: true,
          };
        return n;
      })
    );
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (stepDefinitions === undefined) return;
      const action = stepDefinitions.filter((a) => a.name === droppedType);
      if (action.length === 0) return;
      const newNode = {
        id: generateId(),
        type: "actionNode",
        position: screenToFlowPosition({ x: e.clientX, y: e.clientY }),
        data: structuredClone(action[0]),
      };
      setNodes((nodes) => nodes.concat(newNode as ActionNode));
    },
    [setNodes, stepDefinitions, droppedType]
  );

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="flex flex-col bg-muted"
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      <TopPanel />
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDrag}
        onDrop={onDrop}
        onSelectionStart={onSelectionStart}
        onSelectionChange={() => console.log("selecting")}
        onSelectionEnd={onSelectionEnd}
        proOptions={{ hideAttribution: true }}
        panOnScroll
        panOnDrag={[1, 2]}
        selectionOnDrag
        zoomOnDoubleClick={false}
        selectionMode={SelectionMode.Partial}
      >
        <Sidebar />
        <Controls position="bottom-right" />
        <Background color="#ccc" variant={BackgroundVariant.Cross} />
      </ReactFlow>
    </div>
  );
}
