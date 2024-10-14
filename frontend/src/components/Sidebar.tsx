"use client";
import { ChangeEvent, useCallback } from "react";
import { ActionCard } from "./nodes/ActionNode";
// import { JobCard } from "./JobCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useDragAndDrop } from "@/lib/DragNDropContext";

type SidebarProps = {
  defaults: Step[] | undefined;
  handleGenerate: (prompt: string) => void;
};

export default function Sidebar({ defaults, handleGenerate }: SidebarProps) {
  const [prompt, setPrompt] = useState("");
  const [_, setDroppedType] = useDragAndDrop();

  return (
    <Card
      className="flex flex-col gap-4 p-4 absolute bottom-6 my-auto ml-4 w-1/4 h-4/5 z-10"
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-xl font-bold">Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4 items-center overflow-y-scroll">
        {defaults &&
          defaults.map((step, index) => (
            <div
              className="w-full"
              draggable
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
              }}
              onDragStart={(e) => setDroppedType(step.name)}
            >
              <ActionCard key={index} data={step} compact />
            </div>
          ))}
      </CardContent>
      <Textarea placeholder="Auto generate your workflow" onChange={(e) => setPrompt(e.target.value)}/>
      <Button onClick={() => {handleGenerate(prompt)}}>Generate</Button>
    </Card>
  );
}
