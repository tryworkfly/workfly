import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ClipboardIcon } from "lucide-react";

export default function GeneratedWorkflowDialog({
  workflowName,
  generatedWorkflow,
  setGeneratedWorkflow,
}: {
  workflowName: string;
  generatedWorkflow: string | null;
  setGeneratedWorkflow: (workflow: string | null) => void;
}) {
  return (
    <Dialog
      open={generatedWorkflow !== null}
      onOpenChange={() => setGeneratedWorkflow(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generated Workflow for {workflowName}:</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <pre className="bg-gray-100 p-4 rounded-md">{generatedWorkflow}</pre>
        </DialogDescription>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(generatedWorkflow!);
              toast.success("Copied to clipboard");
            }}
          >
            Copy
            <ClipboardIcon className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="secondary">
            Add to GitHub Repository <GitHubLogoIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
