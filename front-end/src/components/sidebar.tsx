import { useCallback } from "react";
import { ActionCard } from "./ActionCard";

export default function Sidebar(props: {
  defaults: Step[];
  handleDrop: (x: number, y: number, name: Step) => void;
}) {
  const onDrop = useCallback((e: React.DragEvent, data: Step) => {
    props.handleDrop(e.clientX, e.clientY, data);
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
            console.log("Drop event on child");
          }}
          onDragEnd={(e) => onDrop(e, structuredClone(step))}
        >
          <ActionCard key={index} {...step} />
        </div>
      ))}
    </div>
  );
}
