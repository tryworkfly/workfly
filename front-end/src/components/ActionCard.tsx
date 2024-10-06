"use client";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

export type ActionCardNode = Node<Step>;

type updateHandler = (k: string, v: string | number | boolean) => void;

export default function ActionCardNode(props: NodeProps<ActionCardNode>) {
  const { updateNodeData, getNode } = useReactFlow();
  const updateAction = useCallback(
    (k: string, v: string | number | boolean) => {
      console.log(props.id);
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
    },
    []
  );
  return (
    <div>
      <Handle type="source" position={Position.Left} />
      <ActionCard data={props.data} handler={updateAction} />
      <Handle type="target" position={Position.Right} />
    </div>
  );
}

type ActionCardProps = {
  data: Step;
  handler?: updateHandler;
  compact?: boolean;
};

export function ActionCard({ data, handler, compact }: ActionCardProps) {
  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
          <CardDescription>{data.category}</CardDescription>
        </CardHeader>
        <CardContent>{data.description}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96">
      <CardHeader className="pb-3">
        <CardTitle>{data.name}</CardTitle>
        <CardDescription>{data.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        <div className="flex flex-col">
          {data.inputs
            .filter((input) => input.required)
            .map((input, index) => (
              <ActionInput key={index} props={input} handler={handler} />
            ))}
        </div>
        {data.inputs.filter((input) => !input.required).length > 0 && (
          <>
            {data.inputs.filter((input) => input.required).length > 0 && (
              <Separator />
            )}
            <Accordion type="single" collapsible className="p-1">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-2 text-gray-500">
                  Optional Inputs
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 my-2">
                    <div className="grid gap-2">
                      {data.inputs
                        .filter((input) => !input.required)
                        .map((input, index) => (
                          <ActionInput
                            key={index}
                            props={input}
                            handler={handler}
                          />
                        ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ActionInput({
  props,
  handler,
}: {
  props: StepInput;
  handler?: updateHandler;
}) {
  let dftVal: string | number;
  switch (props.type) {
    case "number":
      dftVal = 0;
      break;
    case "string":
      dftVal = "";
      break;
    default:
      dftVal = "";
  }

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-3 items-center gap-4">
        <Tooltip>
          <Label htmlFor={props.name} className="flex items-center gap-1.5">
            {props.name.charAt(0).toUpperCase() + props.name.slice(1)}
            <TooltipTrigger>
              <QuestionMarkCircledIcon className="w-3 h-3 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>{props.description}</TooltipContent>
          </Label>
          {props.type === "boolean" ? (
            <Switch id={props.name} />
          ) : (
            <Input
              id={props.name}
              defaultValue={dftVal}
              type={props.type}
              className="col-span-2 h-8"
              onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
                handler && handler(props.name, event.target.value)
              }
            />
          )}
        </Tooltip>
      </div>
    </div>
  );
}
