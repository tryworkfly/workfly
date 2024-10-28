import fetcher from "@/lib/fetcher";
import { Button } from "./ui/button";
import { useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { toast } from "sonner";
import type { TriggerNode } from "./nodes/TriggerNode";
import logo from "@/assets/logo.png";
import Image from "next/image";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import GeneratedWorkflowDialog from "./GeneratedWorkflowDialog";
import { ActionNode } from "./nodes/ActionNode";
import { Workflow } from "@/types/workflow";
import { makeWorkflow } from "@/lib/workflowUtils";

export default function TopPanel({
  workflowName,
  setWorkflowName,
}: {
  workflowName: string;
  setWorkflowName: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<string | null>(
    null
  );
  const { getNodes, getEdges, getNode, updateNodeData } = useReactFlow<
    ActionNode | TriggerNode
  >();

  const setNodesError = (
    ids: string[],
    message: string,
    description: string
  ) => {
    ids.forEach((id) => {
      updateNodeData(id, { error: true });
    });
    toast(message, {
      description,
    });
  };

  const onSubmit = async () => {
    setSubmitting(true);
    const nodes = getNodes();
    const edges = getEdges();
    let nodeConnectionGraph = new Map<string, string>(
      edges.map((e) => [e.target, e.source])
    );

    const unconnectedNodes = nodes.filter(
      (node) => nodeConnectionGraph.get(node.id) === undefined
    );
    // There should only be one unconnected node which is the last in the graph
    if (unconnectedNodes.length > 1) {
      setNodesError(
        unconnectedNodes.map((node) => node.id),
        "Missing nodes!",
        "Please connect all nodes."
      );
      setSubmitting(false);
      return;
    }

    let currNodeId = nodeConnectionGraph.get("trigger");
    while (currNodeId !== undefined) {
      const node = getNode(currNodeId);
      if (node === undefined) {
        // this should never happen
        setNodesError(
          [],
          "Invalid workflow!",
          "Please check your workflow and try again."
        );
        setSubmitting(false);
        return;
      }

      const data = node.data as ActionNode["data"];
      const unfilledRequiredInput = data.definition.inputs.find(
        (v) => v.required && data.inputs[v.name] === undefined
      );
      if (unfilledRequiredInput) {
        setNodesError(
          [currNodeId],
          "Missing required inputs!",
          "Please fill in all required inputs."
        );
        setSubmitting(false);
        return;
      }
      currNodeId = nodeConnectionGraph.get(currNodeId);
    }

    const triggerNode = getNode("trigger") as TriggerNode;
    const wfRequest = makeWorkflow(workflowName, triggerNode, nodes, edges);

    const newWorkflow = await fetcher<Workflow>("/workflows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wfRequest),
    });

    if (newWorkflow.id) {
      const runRequest: RunRequest = { workflow_id: newWorkflow.id };
      const run = await fetcher<Run>("/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(runRequest),
      });

      if (run.state === "SUCCESS" && run.result) {
        const yaml = run.result;
        setGeneratedWorkflow(yaml);
      } else {
        toast("Error processing workflow", {
          description: "Please try again.",
        });
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="flex px-3 py-1.5 border-b-2 border-b-border bg-background justify-between items-center">
      <div className="flex items-center gap-2">
        <Image src={logo} alt="logo" width={48} height={48} />
        <h1 className="hidden lg:block text-xl font-bold text-primary">
          Workfly
        </h1>
      </div>
      <Input
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.currentTarget instanceof HTMLElement) {
            e.currentTarget.blur();
          }
        }}
        className="w-60 text-center border-none shadow-none font-semibold"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="font-bold"
          >
            {submitting ? "Taking off..." : "Fly"}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Submit workflow!</TooltipContent>
      </Tooltip>
      <GeneratedWorkflowDialog
        workflowName={workflowName}
        generatedWorkflow={generatedWorkflow}
        setGeneratedWorkflow={setGeneratedWorkflow}
      />
    </div>
  );
}
