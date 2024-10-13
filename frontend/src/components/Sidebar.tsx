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

type SidebarProps = {
  defaults: Step[] | undefined;
  handleDrop: (x: number, y: number, type: string, data: Step | Job) => void;
  handleGenerate: (prompt: string) => void;
};

export default function Sidebar({ defaults, handleDrop, handleGenerate }: SidebarProps) {
  const [prompt, setPrompt] = useState("");
  const onActionDrop = useCallback((e: React.DragEvent, data: Step) => {
    handleDrop(e.clientX, e.clientY, "actionNode", data);
  }, []);

  // const onJobDrop = useCallback((e: React.DragEvent) => {
  //   props.handleDrop(e.clientX, e.clientY, "jobNode", { name: "Job #1", steps: [] });
  // }, []);

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
              onDragEnd={(e) => onActionDrop(e, structuredClone(step))}
            >
              <ActionCard key={index} data={step} compact />
            </div>
          ))}
      </CardContent>
      <Textarea placeholder="Auto generate your workflow" onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}/>
      <Button onClick={() => {handleGenerate(prompt)}} >Generate</Button>
      {/* <div
        draggable
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
        }}
        onDragEnd={(e) => onJobDrop(e)}
      >
        <JobCard name="Job #1" steps={[]}/>
      </div> */}
    </Card>
  );
}
