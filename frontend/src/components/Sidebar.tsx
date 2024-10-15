"use client";

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
import { Panel } from "@xyflow/react";
import { BotMessageSquare, Plus, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function StepsTab({ defaults }: { defaults: Step[] | undefined }) {
  const [_, setDroppedType] = useDragAndDrop();

  return (
    <CardContent className="px-3 flex flex-col gap-y-4 items-center overflow-y-scroll">
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
  );
}

function ChatTab({
  handleGenerate,
}: {
  handleGenerate: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState("");

  return (
    <CardContent className="px-3 flex flex-col gap-2 w-72">
      <Textarea
        placeholder="Auto generate your workflow..."
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button
        onClick={() => {
          handleGenerate(prompt);
        }}
      >
        Generate
      </Button>
    </CardContent>
  );
}

type SidebarProps = {
  defaults: Step[] | undefined;
  handleGenerate: (prompt: string) => void;
};

export default function Sidebar({ defaults, handleGenerate }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<number | null>(null);

  const handleTabClick = (i: number) => {
    if (activeTab === i) {
      setActiveTab(null);
    } else {
      setActiveTab(i);
    }
  };

  const tabs = [
    {
      name: "Steps",
      icon: Plus,
      tooltip: "Add new step",
      content: <StepsTab defaults={defaults} />,
    },
    {
      name: "Chat with AI!",
      icon: BotMessageSquare,
      tooltip: "Chat with AI!",
      content: <ChatTab handleGenerate={handleGenerate} />,
    },
  ];

  return (
    <Panel position="top-left" className={activeTab !== null ? "h-[90%]" : ""}>
      <Card className="flex h-full items-center">
        <div className="flex flex-col p-2 gap-2 h-full">
          {tabs.map((tab, i) => (
            <Tooltip key={tab.name}>
              <TooltipTrigger asChild>
                <Button
                  className={`p-3 h-12 w-12 ${
                    activeTab === i ? "bg-accent" : ""
                  }`}
                  variant="ghost"
                  onClick={() => handleTabClick(i)}
                >
                  <tab.icon className="w-full h-full" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tab.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="my-0 h-[95%] border-r border-r-border"></div>
        {activeTab !== null && (
          <div
            className="flex flex-col gap-4 p-4 h-full"
            onDragOver={(e) => {
              e.preventDefault();
            }}
          >
            <Button
              className="absolute top-2 right-2"
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab(null)}
            >
              <X className="w-5 h-5" />
            </Button>
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-xl font-bold">
                {tabs[activeTab].name}
              </CardTitle>
            </CardHeader>
            {tabs[activeTab].content}
          </div>
        )}
      </Card>
    </Panel>
  );
}
