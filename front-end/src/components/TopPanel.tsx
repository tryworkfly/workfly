import fetcher from "@/lib/fetcher";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { toast } from "sonner";
import { writeWorkflowFile } from "@/lib/githubWriter";
import type { TriggerCardNode } from "./nodes/TriggerNode";

export default function TopPanel() {
  const [submitting, setSubmitting] = useState(false);
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
      name: "New workflow",
      runName: "New workflow Runname",
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
    <Card className="absolute top-4 right-4 z-10">
      <Button onClick={onSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Workflow!"}
      </Button>
    </Card>
  );
}
