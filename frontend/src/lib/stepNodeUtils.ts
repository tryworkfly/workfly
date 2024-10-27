import { Step } from "@/types/workflow";
import { ActionNode } from "@/components/nodes/ActionNode";
import { Node, XYPosition } from "@xyflow/react";
import { TriggerNode } from "@/components/nodes/TriggerNode";

export function makeTriggerNode(
  event: string = "push",
  position: XYPosition = { x: 500, y: 300 }
): TriggerNode {
  return {
    id: "trigger",
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
  prevNodes: Node[],
  stepDefinitions: StepDefinition[]
): ActionNode[] {
  return steps.map((newStep) => {
    const step = prevNodes.find((node) => node.id === newStep.id) as
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
    };
  });
}
