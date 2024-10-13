import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Node, NodeProps } from "@xyflow/react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "../ui/select";

export type TriggerCardNode = Node<{ trigger: string }>;

const triggerEvents: [string, string][] = [
  ["On Push", "push"],
  ["On Pull Request", "on_pull_request"],
];

export default function TriggerNode({ id, data }: NodeProps<TriggerCardNode>) {
  const { updateNodeData } = useReactFlow();

  const onTriggerChange = (value: string) => {
    updateNodeData(id, { trigger: value });
  };

  return (
    <div className="w-52 h-28 p-4 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center">
      <Select value={data.trigger} onValueChange={onTriggerChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {triggerEvents.map(([label, value]) => (
            <SelectItem value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Handle type="target" position={Position.Right} />
    </div>
  );
}
