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
          id: Math.random().toString(),
          type: "actionNode",
          position: { x: x, y: y },
          data: data,
        };

        setNodes((nodes) => nodes.concat(newNode as ActionNode));
      } else if (type === "jobNode") {
        console.log("Job Node");
        setNodes((nodes) =>
          nodes.concat({
            id: Math.random().toString(),
            type: "jobNode",
            position: { x, y },
            data: data,
          } as JobNode)
        );
      }
    },
    []
  );

  let newEdges: Edge[] = [];
  const onGenerate = async (prompt: string) => {
    if (prompt === "") return;
    fetch("http://localhost:8000/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    })
      .then((res) => res.json())
      .then((data) => {
        setNodes((nds) => {
          const triggerNode = getNode("trigger");
          if (triggerNode === undefined) return nds;
          let prevNode = triggerNode;
          // console.log(typeof data.response);
          // console.log(data.response);
          // //console.log(data.response.map((action: string) => action));
          // const newNodes: Node[] = [];
          const newNodes = data.response.map((action: string) => {
              let newNode: Node = {
                id: Math.random().toString(),
                type: "actionNode",
                position: {
                  x: 100 + prevNode.position.x,
                  y: 120 + prevNode.position.y,
                },
                data: structuredClone((possibleActions as Step[]).find((step) => step.name === action)) as Step,
              };
              newEdges.push({
                id: Math.random().toString(),
                source: newNode.id,
                target: prevNode.id,
              });
              prevNode = newNode;
              return newNode;
          });
          // const newNodes = (possibleActions as Step[])
          //   .filter((action) => data.response.includes(action.name))
          //   .map((action, i) => {
          //     let newNode = {
          //       id: Math.random().toString(),
          //       type: "actionNode",
          //       position: {
          //         x: 100 + prevNode.position.x,
          //         y: 120 + prevNode.position.y,
          //       },
          //       data: structuredClone(action),
          //     };
          //     newEdges.push({
          //       id: Math.random().toString(),
          //       source: newNode.id,
          //       target: prevNode.id,
          //     });
          //     prevNode = newNode;
          //     return newNode;
          //   });

          return [triggerNode, ...newNodes];
        });
        setEdges((eds) => newEdges);
      });
  };

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="bg-[#CFE7FB]"
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      <Sidebar defaults={possibleActions} handleDrop={addAction} handleGenerate={onGenerate}/>
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
