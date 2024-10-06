import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Handle, Position, Node, NodeProps } from "@xyflow/react";

export type ActionCardNode = Node<Step>;

export default function ActionCard(props: NodeProps<ActionCardNode>) {
  return (
    <div>
      <Handle type="source" position={Position.Left} />
      <Accordion type="single" collapsible className="w-80 bg-white p-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex flex-col gap-y-4 w-full">
              <h4 className="font-medium leading-none text-left">{props.data.name}</h4>
              <p className="text-sm text-muted-foreground text-left">
                  {props.data.description}
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 my-2">
              <div className="grid gap-2">
                  {props.data.inputs.map((input, index) => <ActionInput key={index} {...input} />)}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Handle type="target" position={Position.Right} />
    </div>
  );
}

function ActionInput(props: StepInput) {
  let dftVal : string | number;
  switch (props.type) {
      case "number":
         dftVal = 0;
         break;
      case "string":
         dftVal = "";
         break;
      default:
         dftVal = "";
   };

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor={props.name}>{props.name}</Label>
        {props.type === "boolean" ? 
         <Switch id={props.name} /> : 
         <Input id={props.name} defaultValue={dftVal} type={props.type} className="col-span-2 h-8" />}
      </div>
    </div>
  );
}