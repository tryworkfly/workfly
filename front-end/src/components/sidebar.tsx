'use client';
import { useCallback } from "react";
import { ActionCard } from "./ActionCard";
import { JobCard } from "./JobCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react";

export default function Sidebar(props: {
  defaults: Step[];
  handleDrop: (x: number, y: number, type: string, data: Step | Job) => void;
  handleSubmit: () => void;
  handleGenerate: (prompt: string) => void;
}) {
  const [formData, setFormData] = useState<string>("");
  const onActionDrop = useCallback((e: React.DragEvent, data: Step) => {
    props.handleDrop(e.clientX, e.clientY, "actionNode", data);
  }, []);

  const onJobDrop = useCallback((e: React.DragEvent) => {
    props.handleDrop(e.clientX, e.clientY, "jobNode", { name: "Job #1", steps: [] });
  }, []);

  return (
    <div
      className="absolute shadow-md shadow-slate-200 inset-y-0 my-auto flex flex-col items-center w-1/4 h-5/6 py-[2rem] px-[0.9375rem] ml-4 gap-[1.4375rem] shrink-0 rounded-sm bg-white z-10
        overflow-scroll"
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      {props.defaults.map((step, index) => (
        <div
          draggable
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
          }}
          onDragEnd={(e) => onActionDrop(e, structuredClone(step))}
        >
          <ActionCard key={index} data={step} />
        </div>
      ))}

      <Button onClick={props.handleSubmit}>Submit</Button>
      <Textarea placeholder="Describe what you want to do here" onChange={(e) => setFormData(e.target.value)}/>
      <Button onClick={() => props.handleGenerate(formData)}>Generate Workflow</Button>
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
    </div>
  );
}
