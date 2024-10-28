import { Step } from "@/types/workflow";
import { ActionNode } from "@/components/nodes/ActionNode";
import { Edge, Node, XYPosition } from "@xyflow/react";
import { Workflow } from "@/types/workflow";
import { TriggerNode } from "@/components/nodes/TriggerNode";
import { generateId } from "./utils";

export function makeTriggerNode(
  id: string = "trigger",
  event: string = "push",
  position: XYPosition = { x: 500, y: 300 }
): TriggerNode {
  return {
    id,
    position,
    type: "triggerNode",
    deletable: false,
    data: {
      trigger: event,
    },
  };
}

export function stepsToNodes(
  steps: Step[],
  stepDefinitions: StepDefinition[]
): ActionNode[] {
  return steps.map((newStep) => {
    return {
      id: newStep.id,
      position: newStep.position,
      type: "actionNode",
      data: {
        definition: stepDefinitions.find(
          (step) => step.id === newStep.step_id
        )!,
        inputs: newStep.inputs,
      },
    };
  });
}

export function nodesToSteps(nodes: Node[]): Step[] {
  return (nodes as ActionNode[])
    .map((node) =>
      node.type === "actionNode"
        ? {
            id: node.id,
            name: node.data.definition.name,
            position: node.position,
            inputs: node.data.inputs,
            step_id: node.data.definition.id,
          }
        : null
    )
    .filter((n) => n != null);
}

export function makeWorkflow(
  workflowName: string,
  triggerNode: TriggerNode,
  nodes: Node[],
  edges: Edge[]
) {
  const wfRequest: Workflow = {
    name: workflowName,
    run_name: workflowName,
    trigger: {
      id: triggerNode.id,
      position: triggerNode.position,
      conditions: [
        {
          event: triggerNode.data.trigger,
          config: {},
        },
      ],
    },
    jobs: [
      {
        id: generateId(),
        name: "Main Job",
        steps: nodesToSteps(nodes),
        step_edges: edges.map(
          (e) =>
            ({ id: e.id, source: e.source, target: e.target } satisfies Edge)
        ),
      },
    ],
    job_edges: [],
  };

  return wfRequest;
}
