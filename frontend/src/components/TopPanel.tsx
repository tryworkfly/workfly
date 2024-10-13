import fetcher from "@/lib/fetcher";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Panel, useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { toast } from "sonner";
import { writeWorkflowFile } from "@/lib/githubWriter";
import type { TriggerCardNode } from "./nodes/TriggerNode";
import logo from "@/assets/logo.png";
import Image from "next/image";
import { Input } from "./ui/input";
import { PlaneTakeoff, Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function TopPanel() {
  const [submitting, setSubmitting] = useState(false);
  const [workflowName, setWorkflowName] = useState("My New Workflow");
  const { getNodes, getEdges, getNode } = useReactFlow();

  const onSubmit = async () => {
    setSubmitting(true);
    const nodes = getNodes();
    const edges = getEdges();
    let nodeIdGraph = new Map();
    for (const e of edges) {
      nodeIdGraph.set(e.target, e.source);
    }
    // check if all nodes are connected
    if (nodeIdGraph.size === 0) {
      toast("No workflow found!", {
        description: "Please add a trigger node to the graph.",
      });
      setSubmitting(false);
      return;
    }

    let wfRequest: WorkflowRequest = {
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

    let currNodeId = nodeIdGraph.get("trigger");
    while (currNodeId !== undefined) {
      const node = getNode(currNodeId);
      if (node === undefined) {
        // this should never happen
        toast("Invalid workflow!", {
          description: "Please check your workflow and try again.",
        });
        setSubmitting(false);
        return;
      }

      const data = node.data as Step;
      if (data.inputs.some((v) => v.required && v.value === undefined)) {
        toast("Missing required inputs!", {
          description: "Please fill in all required inputs.",
        });
        setSubmitting(false);
        return;
      }
      wfRequest.jobs[0].steps.push({
        name: data.name,
        id: data.id,
        inputs: data.inputs.reduce(
          (obj, s) => ({ ...obj, [s.name]: s.value }),
          {}
        ),
      });
      currNodeId = nodeIdGraph.get(currNodeId);
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
      console.log(yaml);

      // await writeWorkflowFile(
      //   "tryworkfly",
      //   "gh-actions-test",
      //   `test-${Date.now()}`,
      //   yaml as string
      // );

      toast("Workflow processed successfully!", {
        description: "Workflow was successfully added to repository.",
      });
    } else {
      toast("Error processing workflow", {
        description: "Please try again.",
      });
    }

    setSubmitting(false);
  };

  return (
    <Panel position="top-center" className="w-full p-4" style={{ margin: 0 }}>
      <Card className="flex px-3 py-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src={logo} alt="logo" width={48} height={48} />
          <h1 className="text-xl font-bold text-primary">Workfly</h1>
        </div>
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="w-60 text-center border-none shadow-none font-semibold"
        />
        <Tooltip>
          <TooltipTrigger>
            <Button
              onClick={onSubmit}
              disabled={submitting}
              className="font-bold"
            >
              {submitting ? "Taking off..." : "Fly"}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Submit workflow</TooltipContent>
        </Tooltip>
      </Card>
    </Panel>
  );
}
