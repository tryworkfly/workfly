import { Handle, Position } from "@xyflow/react";
import { Node, NodeProps } from "@xyflow/react";

export type TriggerCardNode = Node<{label: string}>;

export default function TriggerNode(props: NodeProps<TriggerCardNode>) {
  return (
    <div className="w-20 h-20 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center">
      <span>{props.data.label}</span>
      <Handle type="target" position={Position.Right} />
    </div>
  );
}