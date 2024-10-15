import fetcher from "@/lib/fetcher";
import { Button } from "./ui/button";
import { useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { toast } from "sonner";
import type { TriggerCardNode } from "./nodes/TriggerNode";
import logo from "@/assets/logo.png";
import Image from "next/image";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import GeneratedWorkflowDialog from "./GeneratedWorkflowDialog";
import { ActionNode } from "./nodes/ActionNode";

export default function TopPanel() {
  const [submitting, setSubmitting] = useState(false);
  const [workflowName, setWorkflowName] = useState("My New Workflow");
  const [generatedWorkflow, setGeneratedWorkflow] = useState<string | null>(
    null
  );
  const { getNodes, getEdges, getNode, updateNodeData } = useReactFlow<
    ActionNode | TriggerCardNode
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

    const wfRequest: WorkflowRequest = {
      name: workflowName,
      runName: workflowName,
      trigger: [
        {
          event: (getNode("trigger") as TriggerCardNode).data.trigger,
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

      const data = node.data as Step;
      const unfilledRequiredInput = data.inputs.find(
        (v) => v.required && v.value === undefined
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

      const newStep: StepRequest = {
        name: data.name,
        id: data.id,
        inputs: Object.fromEntries(
          data.inputs.map((input) => [input.name, input.value])
        ),
      };
      wfRequest.jobs[0].steps.push(newStep);
      currNodeId = nodeConnectionGraph.get(currNodeId);
    }

    const data = await fetcher("/workflows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wfRequest),
    });

    if (typeof data == "object" && data && "workflowYaml" in data) {
      const yaml = data["workflowYaml"];
      setGeneratedWorkflow(yaml as string);
    } else {
      toast("Error processing workflow", {
        description: "Please try again.",
      });
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
