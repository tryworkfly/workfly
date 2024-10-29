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
import type { ActionNode } from "@/components/nodes/ActionNode";
import nodeTypes from "./nodeTypes";
import Sidebar from "@/components/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopPanel from "@/components/TopPanel";
import { generateId } from "@/lib/utils";
import { DragNDropProvider, useDragAndDrop } from "@/lib/DragNDropContext";
import useStepDefinitions from "@/hooks/useSteps";
import { useWorkflow } from "@/hooks/useWorkflows";
import {
  makeTriggerNode,
} from "@/lib/workflowUtils";
import useLoadSave from "@/hooks/useLoadSave";

const initialNodes: Node[] = [makeTriggerNode()];

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
  const [droppedType] = useDragAndDrop();
  const { stepDefinitions } = useStepDefinitions();
  const { workflow } = useWorkflow(id);
  const [workflowName, setWorkflowName] = useState("My New Workflow");
  const { isSaving, lastSavedTimestamp } = useLoadSave(
    id,
    workflowName,
    setWorkflowName,
    nodes,
    edges
  );

  const { getIntersectingNodes, updateNodeData, screenToFlowPosition } =
    useReactFlow();

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
    workflow &&
    stepDefinitions && (
      <div
        style={{ width: "100vw", height: "100vh" }}
        className="flex flex-col bg-muted"
        onDragOver={(e) => {
          e.preventDefault();
        }}
      >
        <TopPanel
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
          jobId={workflow?.jobs[0].id}
          isSaving={isSaving}
          lastSavedTimestamp={lastSavedTimestamp}
        />
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
          // onSelectionChange={() => console.log("selecting")}
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
    )
  );
}
