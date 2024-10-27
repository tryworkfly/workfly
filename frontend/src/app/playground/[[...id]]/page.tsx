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
import { WorkflowAIResponse } from "../../../types/ai";
import { generateId } from "@/lib/utils";
import { DragNDropProvider, useDragAndDrop } from "@/lib/DragNDropContext";
import { toast } from "sonner";
import useStepDefinitions from "@/hooks/useSteps";
import { useWorkflow } from "@/hooks/useWorkflows";
import { TriggerNode } from "@/components/nodes/TriggerNode";

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

export default function App({ params }: { params: { id?: string[] } }) {
  return (
    <TooltipProvider delayDuration={0}>
      <ReactFlowProvider>
        <DragNDropProvider>
          <Playground id={params.id?.at(0)} />
        </DragNDropProvider>
      </ReactFlowProvider>
    </TooltipProvider>
  );
}

function Playground({ id }: { id?: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectStartPos, setSelectStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [droppedType, _] = useDragAndDrop();
  const { stepDefinitions } = useStepDefinitions();
  const { workflow } = useWorkflow(id);

  const { getIntersectingNodes, updateNodeData, screenToFlowPosition } =
    useReactFlow();

  useEffect(() => {
    // Currently don't support multiple jobs
    if (workflow && stepDefinitions) {
      const steps = workflow.jobs[0].steps;

      setNodes((prev) => {
        const trigger = prev.find((node) => node.id === "trigger") as
          | TriggerNode
          | undefined;

        return [
          {
            id: "trigger",
            position: trigger?.position ?? { x: 0, y: 0 },
            type: "triggerNode",
            deletable: false,
            data: {
              trigger: trigger?.data.trigger ?? "push",
            },
          } satisfies TriggerNode,
          ...steps.map((newStep) => {
            const step = prev.find((node) => node.id === newStep.id) as
              | ActionNode
              | undefined;

            return {
              id: newStep.id,
              position: newStep.position ?? step?.position ?? { x: 0, y: 0 },
              type: "actionNode",
              data: {
                definition: stepDefinitions.find(
                  (step) => step.id === newStep.step_id
                )!,
                inputs: newStep.inputs ?? step?.data.inputs ?? {},
              },
            } satisfies ActionNode;
          }),
        ];
      });

      const newEdges = steps.reduce((prev, curr) => {
        const prevEdge = prev.at(-1);
        if (prevEdge) {
          const prevTarget = prevEdge[1];
          return [...prev, [prevTarget, curr.id] satisfies [string, string]];
        } else {
          // first node -> trigger node
          return [...prev, ["trigger", curr.id] satisfies [string, string]];
        }
      }, [] as [string, string][]);
      setEdges((prev) =>
        newEdges.map(([newTarget, newSource]) => {
          const edge = prev.find(
            (prevEdge) =>
              prevEdge.source === newTarget && prevEdge.target === newSource
          );

          return {
            id: edge?.id ?? generateId(),
            source: newSource,
            target: newTarget,
          };
        })
      );
    }
  }, [workflow, stepDefinitions]);

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
      console.log("drop!!!");
      if (stepDefinitions === undefined) return;
      const action = stepDefinitions.filter((a) => a.name === droppedType);
      if (action.length === 0) return;
      const newNode: ActionNode = {
        id: generateId(),
        type: "actionNode",
        position: screenToFlowPosition({ x: e.clientX, y: e.clientY }),
        data: { definition: structuredClone(action[0]), inputs: {} },
      };
      setNodes((nodes) => nodes.concat(newNode));
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