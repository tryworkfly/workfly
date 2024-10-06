'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node, NodeProps, Handle, Position, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

export type ActionCardNode = Node<Step>;

type updateHandler = (k: string, v: string | number | boolean) => void;

export default function ActionCardNode(props: NodeProps<ActionCardNode>) {
   const { updateNodeData, getNode } = useReactFlow();
   const updateAction = useCallback((k: string, v: string | number | boolean) => {
     console.log(props.id)
     let currNode = getNode(props.id) as ActionCardNode;
     updateNodeData(props.id, {
       ...currNode?.data,
       inputs: currNode?.data.inputs.map((input) => {
         if (input.name === k) {
           return { ...input, value: v };
         }
         return input;
       }),
     });
   }, []);
  return (
    <div>
      <Handle type="source" position={Position.Left} />
      <ActionCard data={props.data} handler={updateAction}/>
      <Handle type="target" position={Position.Right} />
    </div>
  );
}

export function ActionCard({data, handler}: {data: Step, handler?: updateHandler}) {
   return (
      <Accordion type="single" collapsible className="w-80 bg-white p-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex flex-col gap-y-4 w-full">
              <h4 className="font-medium leading-none text-left">{data.name}</h4>
              <p className="text-sm text-muted-foreground text-left">
                  {data.description}
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 my-2">
              <div className="grid gap-2">
                  {data.inputs.map((input, index) => <ActionInput key={index} props={input} handler={handler} />)}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
   );
}

function ActionInput({props, handler}: {props: StepInput, handler?: updateHandler}) {
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
        {props.type === "boolean" ? (
          <Switch id={props.name} />
        ) : (
          <Input
            id={props.name}
            defaultValue={dftVal}
            type={props.type}
            className="col-span-2 h-8"
            onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
              handler &&
               handler(props.name, event.target.value)
            }
          />
        )}
      </div>
    </div>
  );
}