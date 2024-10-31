import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ClipboardIcon } from "lucide-react";
import { writeWorkflowFile } from "@/lib/githubWriter";
import { useExport } from "@/hooks/useExports";
import { useEffect } from "react";

export default function GeneratedWorkflowDialog({
  workflowName,
  exportId,
  setExportId,
}: {
  workflowName: string;
  exportId: string | undefined;
  setExportId: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
  const { workflowExport } = useExport(exportId);

  const onCopyToClipboard = () => {
    navigator.clipboard.writeText(exportId!);
    toast.success("Copied to clipboard");
  };

  const onAddToGitHub = async () => {
    if (workflowExport?.result) {
      await writeWorkflowFile(
        "tryworkfly",
        "gh-actions-test",
        workflowName.toLowerCase().replace(/ /g, "_"),
        workflowExport.result
      );
      toast.success("Added to GitHub", {
        description: "Check your repository to see the workflow.",
      });
    }
  };

  useEffect(() => {
    if (workflowExport?.state === "FAILED") {
      toast.error("Error exporting workflow", {
        description: workflowExport.result,
      });
    }
  }, [workflowExport]);

  return (
    <Dialog
      open={
        exportId !== null &&
        workflowExport !== null &&
        workflowExport?.state == "SUCCEEDED"
      }
      onOpenChange={() => setExportId(undefined)}
    >
      <DialogContent className="flex flex-col rounded-lg w-[95dvw] lg:w-[50dvw] lg:max-w-[70dvw]">
        <DialogHeader>
          <DialogTitle>Generated Workflow for {workflowName}:</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-scroll">
            {workflowExport?.result}
          </pre>
        </DialogDescription>
        <div className="flex gap-2">
          <Button onClick={onCopyToClipboard}>
            Copy
            <ClipboardIcon className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="secondary" onClick={onAddToGitHub}>
            Add to GitHub Repository <GitHubLogoIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
