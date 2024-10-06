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
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { ActionCardNode } from "@/components/ActionCard";
import { JobCardNode } from "@/components/JobCard";
import nodeTypes from "@/components/NodeTypes";
import Sidebar from "@/components/sidebar";

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

export default function Playground() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [possibleActions, setPossibleActions] = useState<Step[]>([]);
   useEffect(() => {
      // fetch("/api/actions")
      //    .then((res) => res.json())
      //    .then((data) => setPossibleActions(data));   
      setPossibleActions([
        {
          name: "Deploy",
          description: "This step deploy the website",
          inputs: [
            {
              name: "API key",
              description: "API KEY",
              type: "string",
              required: true,
            },
            {
              name: "Magic number",
              description: "Magic number",
              type: "number",
              required: false,
            },
          ],
        },
        {
          name: "Checkout",
          description: "This step checkout",
          inputs: [
            {
              name: "input1",
              description: "This is the first input",
              type: "string",
              required: true,
            },
            {
              name: "input2",
              description: "This is the second input",
              type: "boolean",
              required: false,
            },
          ],
        },
      ]);
   }, []);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  

  const addAction = useCallback((x: number, y: number, type: string, data: Step | {name: string}) => {
   // console.log("X: ", x, "Y: ", y, "Action: ", actionType);
   if (type === "actionNode") {
     setNodes((nodes) =>
       nodes.concat({
         id: Math.random().toString(),
         type: "actionNode",
         position: { x, y },
         data: data,
       } as ActionCardNode)
     );
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
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }} className="bg-[#CFE7FB]"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      >
      <Sidebar defaults={possibleActions} handleDrop={addAction}/>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <Background color="#ccc" variant={BackgroundVariant.Cross} />
      </ReactFlow>
    </div>
  );
}
