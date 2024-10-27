import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Node, NodeProps } from "@xyflow/react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "../ui/select";
import { Card, CardTitle, CardHeader, CardContent } from "../ui/card";
import type { NodeData } from "@/types/node";

export type TriggerNode = Node<NodeData & { trigger: string }>;

const triggerEvents: [string, string][] = [
  ["On Push", "push"],
  ["On Pull Request", "on_pull_request"],
];

export default function TriggerNode({
  id,
  data,
  selected,
}: NodeProps<TriggerNode>) {
  const { updateNodeData } = useReactFlow();

  const onTriggerChange = (value: string) => {
    updateNodeData(id, { trigger: value });
  };

  return (
    <Card
      className={`w-52 flex flex-col rounded-[3rem] ${
        selected ? "border-2 border-primary" : ""
      }`}
    >
      <CardHeader>
        <CardTitle>Start</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={data.trigger} onValueChange={onTriggerChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {triggerEvents.map(([label, value]) => (
              <SelectItem key={label} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <Handle type="target" position={Position.Right} />
    </Card>
  );
}
