import { useCallback } from "react";
import { ActionCard } from "./ActionCard";
import { JobCard } from "./JobCard";

export default function Sidebar(props: {
  defaults: Step[];
  handleDrop: (x: number, y: number, type: string, data: Step | {name: string}) => void;
}) {
  const onActionDrop = useCallback((e: React.DragEvent, data: Step) => {
    props.handleDrop(e.clientX, e.clientY, "actionNode", data);
  }, []);

  const onJobDrop = useCallback((e: React.DragEvent) => {
    props.handleDrop(e.clientX, e.clientY, "jobNode", { name: "Job #1" });
  }, []);

  return (
    <div
      className="absolute shadow-md shadow-slate-200 inset-y-0 my-auto flex flex-col items-center w-1/4 h-5/6 py-[2rem] px-[0.9375rem] ml-4 gap-[1.4375rem] shrink-0 rounded-sm bg-white z-10"
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
          <ActionCard key={index} {...step} />
        </div>
      ))}
      <div
        draggable
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
        }}
        onDragEnd={(e) => onJobDrop(e)}
      >
        <JobCard />
      </div>
    </div>
  );
}
