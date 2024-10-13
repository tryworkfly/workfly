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

const initialNodes: Node[] = [
  {
    id: "trigger",
    type: "triggerNode",
    position: { x: 500, y: 300 },
    data: { label: "On Push" },
    deletable: false,
  },
];

const initialEdges: Edge[] = [];

export default function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <ReactFlowProvider>
        <Playground />
      </ReactFlowProvider>
    </TooltipProvider>
  );
}

function Playground() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { data: possibleActions } = useSWR<Step[]>("/steps", fetcher);
  const { getIntersectingNodes, getNode } = useReactFlow();

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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

  const addAction = useCallback(
    async (x: number, y: number, type: string, data: Step | Job) => {
      if (type === "actionNode") {
        const newNode = {
          id: generateId(),
          type: "actionNode",
          position: { x: x, y: y },
          data: data,
        };

        setNodes((nodes) => nodes.concat(newNode as ActionNode));
      }
      // else if (type === "jobNode") {
      //   console.log("Job Node");
      //   setNodes((nodes) =>
      //     nodes.concat({
      //       id: generateId(),
      //       type: "jobNode",
      //       position: { x, y },
      //       data: data,
      //     } as JobNode)
      //   );
      // }
    },
    []
  );

  let newEdges: Edge[] = [];
  const onGenerate = async (prompt: string) => {
    if (prompt === "" || possibleActions === undefined) return;
    const data = await fetcher<WorkflowAIResponse>("/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    });
    setNodes((prev) => {
      const triggerNode = getNode("trigger");
      if (triggerNode === undefined) return prev;

      try {
        return data.actions.reduce(
          (prev, curr) => {
            const prevNode = prev.at(-1);
            if (prevNode === undefined) throw new Error("Prev node not found");

            const step = possibleActions.find((step) => step.name === curr);
            if (step === undefined) throw new Error("Step not found");

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
      } catch (e) {
        return prev;
      }
      // const newNodes = (possibleActions as Step[])
      //   .filter((action) => data.response.includes(action.name))
      //   .map((action, i) => {
      //     let newNode = {
      //       id: generateId(),
      //       type: "actionNode",
      //       position: {
      //         x: 100 + prevNode.position.x,
      //         y: 120 + prevNode.position.y,
      //       },
      //       data: structuredClone(action),
      //     };
      //     newEdges.push({
      //       id: generateId(),
      //       source: newNode.id,
      //       target: prevNode.id,
      //     });
      //     prevNode = newNode;
      //     return newNode;
      //   });
    });
    setEdges(newEdges);
  };

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="bg-[#ecf4fb]"
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      <Sidebar
        defaults={possibleActions}
        handleDrop={addAction}
        handleGenerate={onGenerate}
      />
      <TopPanel />
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDrag}
      >
        <Controls />
        <Background color="#ccc" variant={BackgroundVariant.Cross} />
      </ReactFlow>
    </div>
  );
}
