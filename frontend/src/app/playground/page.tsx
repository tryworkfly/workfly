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

  const { data: possibleActions } = useSWR<Step[]>("/steps", fetcher);
  const { getIntersectingNodes, getNode, screenToFlowPosition } =
    useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
      if (possibleActions === undefined) return;
      const action = possibleActions.filter((a) => a.name === droppedType);
      if (action.length === 0) return;
      const newNode = {
        id: generateId(),
        type: "actionNode",
        position: screenToFlowPosition({ x: e.clientX, y: e.clientY }),
        data: structuredClone(action[0]),
      };
      setNodes((nodes) => nodes.concat(newNode as ActionNode));
    },
    [setNodes, possibleActions, droppedType]
  );

  const onGenerate = async (prompt: string) => {
    if (prompt === "" || possibleActions === undefined) return;
    const data = await fetcher<WorkflowAIResponse>("/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    const newEdges: Edge[] = [];
    const triggerNode = getNode("trigger");
    if (triggerNode === undefined) return; // pass

    try {
      const newNodes = data.actions.reduce(
        (prev, curr) => {
          const prevNode = prev.at(-1);
          if (prevNode === undefined) throw new Error("Prev node not found.");

          const step = possibleActions.find((step) => step.name === curr);
          if (step === undefined) throw new Error("Step not found.");

          const newNode: ActionNode = {
            id: generateId(),
            type: "actionNode",
            position: {
              x: 300 + prevNode.position.x,
              y: prevNode.position.y,
            },
            data: structuredClone(step),
          };
          newEdges.push({
            id: generateId(),
            source: newNode.id,
            target: prevNode.id,
          });
          return [...prev, newNode];
        },
        [triggerNode]
      );
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (e) {
      toast("Error generating workflow", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
  };

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
        <Sidebar defaults={possibleActions} handleGenerate={onGenerate} />
        <Controls position="bottom-right" />
        <Background color="#ccc" variant={BackgroundVariant.Cross} />
      </ReactFlow>
    </div>
  );
}
