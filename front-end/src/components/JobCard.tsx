import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Node } from "@xyflow/react";

export type JobCardNode = Node<Job>;

export default function JobCardNode(props: any) {
  return (
    <div className="w-full h-full">
      <Handle type="source" position={Position.Left} />
      <JobCard {...props.data} />
      <Handle type="target" position={Position.Right} />
    </div>
  );
}

export function JobCard(data: Job) {
  return (
    <div className="min-w-80 min-h-40 h-full p-1 border-dashed border-blue-400 border-4">
      <Input type="text" placeholder={data.name} className="w-20" />
    </div>
  );
}