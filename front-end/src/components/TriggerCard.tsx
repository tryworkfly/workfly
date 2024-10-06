import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Node, NodeProps } from "@xyflow/react";

export type TriggerCardNode = Node<{label: string}>;

export default function TriggerCardNode(props: NodeProps<TriggerCardNode>) {
  return (
    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
      <span>{props.data.label}</span>
      <Handle type="target" position={Position.Right} />
    </div>
  );
}