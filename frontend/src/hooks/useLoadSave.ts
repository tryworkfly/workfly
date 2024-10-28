import { Edge, Node, useReactFlow } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import fetcher from "@/lib/fetcher";
import { Workflow } from "@/types/workflow";
import useSWRMutation from "swr/mutation";
import {
  makeTriggerNode,
  makeWorkflow,
  stepsToNodes,
} from "@/lib/workflowUtils";
import { generateId } from "@/lib/utils";
import _ from "lodash";
import useStepDefinitions from "./useSteps";
import { useWorkflow } from "./useWorkflows";

async function updateWorkflow(key: string, { arg }: { arg: Workflow }) {
  const workflow = arg;
  delete workflow.id;

  return await fetcher<Workflow>(key, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workflow),
  });
}

const INACTIVITY_SAVE_TIMEOUT = 1000;

function useLoadSave(
  workflowId: string | undefined,
  workflowName: string,
  setWorkflowName: React.Dispatch<React.SetStateAction<string>>,
  nodes: Node[],
  edges: Edge[]
) {
  const { stepDefinitions } = useStepDefinitions();
  const { workflow } = useWorkflow(workflowId);

  const [initialLoaded, setInitialLoaded] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  const saveTimerRef = useRef<number | undefined>(undefined);
  const { trigger, isMutating } = useSWRMutation(
    workflowId ? `/workflows/${workflowId}` : null,
    updateWorkflow
  );
  const [saving, setSaving] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<Date | null>(
    null
  );

  // When workflow changes convert it to nodes/edges
  useEffect(() => {
    // Currently don't support multiple jobs
    if (workflow && stepDefinitions) {
      setWorkflowName(workflow.name);

      const steps = workflow.jobs[0].steps;
      const stepEdges = workflow.jobs[0].step_edges;

      setNodes([
        makeTriggerNode(
          workflow.trigger.id,
          workflow.trigger.conditions[0].event,
          workflow.trigger.position
        ),
        ...stepsToNodes(steps, stepDefinitions),
      ]);
      setEdges(stepEdges);
      setInitialLoaded(true);
    }
  }, [workflow, stepDefinitions]);

  // When nodes/edges change convert to workflow and PUT
  useEffect(() => {
    if (initialLoaded && workflow && stepDefinitions && !isMutating) {
      // Compare everything about the workflows except id
      // Because we don't include ID when we make workflows
      const newWorkflow = makeWorkflow(
        workflowName,
        workflow.jobs[0].id,
        nodes,
        edges
      );
      const { id: unused, ...oldWorkflow } = workflow;
      const workflowChanged = !_.isEqual(oldWorkflow, newWorkflow);
      if (!workflowChanged) return;

      clearTimeout(saveTimerRef.current);
      setSaving(true);
      // @ts-expect-error using web settimeout not nodejs settimeout
      saveTimerRef.current = setTimeout(() => {
        trigger(
          makeWorkflow(
            workflowName,
            workflow?.jobs[0].id ?? generateId(),
            nodes,
            edges
          )
        );
        setLastSavedTimestamp(new Date());
        setSaving(false);
      }, INACTIVITY_SAVE_TIMEOUT);
    }
  }, [nodes, edges]);

  return {
    isSaving: saving,
    lastSavedTimestamp,
  };
}

export default useLoadSave;
