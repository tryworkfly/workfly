import fetcher, { apiUrl } from "@/lib/fetcher";
import { Button } from "./ui/button";
import { useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { TriggerNode } from "./nodes/TriggerNode";
import logo from "@/assets/logo.png";
import Image from "next/image";
import { Input } from "./ui/input";
import { Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import GeneratedWorkflowDialog from "./GeneratedWorkflowDialog";
import { ActionNode } from "./nodes/ActionNode";
import { useCurrentWorkflow } from "@/hooks/useWorkflows";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useExport } from "@/hooks/useExports";

export default function TopPanel({
  workflowName,
  setWorkflowName,
  isSaving,
  lastSavedTimestamp,
}: {
  workflowName: string;
  setWorkflowName: React.Dispatch<React.SetStateAction<string>>;
  isSaving: boolean;
  lastSavedTimestamp: Date | null;
}) {
  const [currentWorkflowName, setCurrentWorkflowName] = useState(workflowName);
  const [submitting, setSubmitting] = useState(false);
  const [exportId, setExportId] = useState<string | undefined>(undefined);
  const { workflow } = useCurrentWorkflow();
  const { workflowExport, mutate } = useExport(exportId);
  const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(apiUrl);
  const { getNodes, getEdges, getNode, updateNodeData } = useReactFlow<
    ActionNode | TriggerNode
  >();

  // For some reason if we try to delay rendering until after workflowName has been set from the fetched workflow,
  // react flow will eat all the nodes/edges. So we need this intermediate state thing because we need to set
  // the value in the topbar, but we only want to trigger a save action on blur, not on change
  useEffect(() => setCurrentWorkflowName(workflowName), [workflowName]);

  useEffect(() => {
    if (workflowExport && workflowExport.state !== "RUNNING")
      setSubmitting(false);
  }, [workflowExport, setSubmitting]);

  useEffect(() => {
    if (typeof lastJsonMessage === "object" && lastJsonMessage) {
      const message = lastJsonMessage as {
        route: string;
        payload: Record<string, any>;
      };

      switch (message.route) {
        case "export_status_changed":
          mutate();
          break;
        case "error":
          toast.error("Something went wrong in backend connection", {
            description: message.payload.message,
          });
      }
    }
  }, [lastJsonMessage]);

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
    const jobId = workflow?.jobs[0].name;
    if (!jobId) return;
    if (readyState !== ReadyState.OPEN) return;
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

    if (workflow?.id) {
      const exportRequest: ExportRequest = { workflow_id: workflow.id };
      const workflowExport = await fetcher<Export>("/exports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportRequest),
      });
      setExportId(workflowExport.id);
      sendJsonMessage({
        route: "export",
        payload: {
          export_id: workflowExport.id,
        },
      });
    }
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
        value={currentWorkflowName}
        onChange={(e) => setCurrentWorkflowName(e.target.value)}
        onBlur={(e) => setWorkflowName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.currentTarget instanceof HTMLElement) {
            e.currentTarget.blur();
          }
        }}
        className="absolute inset-x-0 mx-auto w-60 text-center border-none shadow-none font-semibold"
      />
      <div className="flex items-center gap-4">
        <p className="text-xs text-muted-foreground text-right">
          {isSaving
            ? "Saving..."
            : lastSavedTimestamp
            ? `Last saved at ${lastSavedTimestamp.toLocaleString()}`
            : ""}
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onSubmit}
              disabled={submitting || !workflow}
              className="font-bold"
            >
              {submitting ? "Taking off..." : "Fly"}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Submit workflow!</TooltipContent>
        </Tooltip>
      </div>
      <GeneratedWorkflowDialog
        workflowName={workflowName}
        exportId={exportId}
        setExportId={setExportId}
      />
    </div>
  );
}
