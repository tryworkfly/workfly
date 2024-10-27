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

export default function GeneratedWorkflowDialog({
  workflowName,
  generatedWorkflow,
  setGeneratedWorkflow,
}: {
  workflowName: string;
  generatedWorkflow: string | null;
  setGeneratedWorkflow: (workflow: string | null) => void;
}) {
  const onCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedWorkflow!);
    toast.success("Copied to clipboard");
  };

  const onAddToGitHub = async () => {
    await writeWorkflowFile(
      "tryworkfly",
      "gh-actions-test",
      workflowName.toLowerCase().replace(/ /g, "_"),
      generatedWorkflow as string
    );
    toast.success("Added to GitHub", {
      description: "Check your repository to see the workflow.",
    });
  };

  return (
    <Dialog
      open={generatedWorkflow !== null}
      onOpenChange={() => setGeneratedWorkflow(null)}
    >
      <DialogContent className="flex flex-col rounded-lg w-[95dvw] lg:w-[50dvw] lg:max-w-[70dvw]">
        <DialogHeader>
          <DialogTitle>Generated Workflow for {workflowName}:</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-scroll">
            {generatedWorkflow}
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
