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
import { ActionCardNode } from "@/components/ActionCard";
import { JobCardNode } from "@/components/JobCard";
import nodeTypes from "@/components/NodeTypes";
import Sidebar from "@/components/sidebar";

const initialNodes: Node[] = [
  {
    id: "trigger",
    type: "triggerNode",
    position: { x: 500, y: 300 },
    data: { label: "onPush" },
    deletable: false,
  },
];

const initialEdges: Edge[] = [];

export default function App() {
  return (
    <ReactFlowProvider>
      <Playground />
    </ReactFlowProvider>
  );
}

function Playground() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [possibleActions, setPossibleActions] = useState<Step[]>([]);
  // const { getInterSectionNodes}
  const { getIntersectingNodes, getZoom, getNodes, getEdges, getNode } =
    useReactFlow();
  useEffect(() => {
    fetch("http://localhost:8000/steps")
      .then((res) => res.json())
      .then((data) => setPossibleActions(data));
  }, []);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onSubmit = async () => {
    const nodes = getNodes();
    const edges = getEdges();
    let graph = new Map();
    for (const e of edges) {
      graph.set(e.target, e.source);
    }

    if (graph.size === 0) return;

    let wfRequest: WorkflowRequest = {
      name: "New workflow",
      runName: "New workflow Runname",
      trigger: [
        {
          event: "push",
          config: {},
        },
      ],
      jobs: [
        {
          name: "Main Job",
          steps: [],
        },
      ],
      jobEdges: [],
    };

    let currNodeId = graph.get("trigger");
    while (true) {
      const node = getNode(currNodeId);
      if (node === undefined) return;
      let data = node.data as Step;
      if (data.inputs.some((v) => v.required && v.value === undefined)) return;
      wfRequest.jobs[0].steps.push({
        name: data.name,
        id: data.id,
        inputs: data.inputs.reduce(
          (obj, s) => ({ ...obj, [s.name]: s.value }),
          {}
        ),
      });
      if (!graph.has(currNodeId)) break;
      currNodeId = graph.get(currNodeId);
    }
    const rsp = await fetch("http://localhost:8000/workflows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wfRequest),
    });
    const data = await rsp.json();
    console.log(data);
  };

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

        setNodes((nodes) => nodes.concat(newNode as ActionCardNode));
      } else if (type === "jobNode") {
        console.log("Job Node");
        setNodes((nodes) =>
          nodes.concat({
            id: Math.random().toString(),
            type: "jobNode",
            position: { x, y },
            data: data,
          } as JobCardNode)
        );
      }
    },
    []
  );

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="bg-[#CFE7FB]"
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      <Sidebar
        defaults={possibleActions}
        handleDrop={addAction}
        handleSubmit={onSubmit}
      />
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
