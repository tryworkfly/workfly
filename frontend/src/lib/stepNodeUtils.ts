import { Step } from "@/types/workflow";
import { ActionNode } from "@/components/nodes/ActionNode";
import { Node, XYPosition } from "@xyflow/react";
import { TriggerNode } from "@/components/nodes/TriggerNode";

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
