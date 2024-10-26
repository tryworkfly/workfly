"use client";

import { ActionCard, ActionNode } from "./nodes/ActionNode";
// import { JobCard } from "./JobCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useDragAndDrop } from "@/lib/DragNDropContext";
import { Edge, Panel, useReactFlow } from "@xyflow/react";
import { BotMessageSquare, Plus, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { WorkflowAIResponse } from "@/types/ai";
import fetcher from "@/lib/fetcher";
import useStepDefinitions from "@/hooks/useSteps";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";

function StepsTab() {
  const { stepDefinitions } = useStepDefinitions();
  const [_, setDroppedType] = useDragAndDrop();

  return (
    <CardContent className="px-3 flex flex-col gap-y-4 items-center overflow-y-scroll">
      {stepDefinitions &&
        stepDefinitions.map((step, index) => (
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

function ChatTab() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { stepDefinitions: allSteps } = useStepDefinitions();
  const { setNodes, setEdges, getNode } = useReactFlow();

  const onGenerate = async () => {
    if (prompt === "" || allSteps === undefined) return;
    setIsGenerating(true);
    const data = await fetcher<WorkflowAIResponse>("/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    const newEdges: Edge[] = [];
    const triggerNode = getNode("trigger");
    if (triggerNode === undefined) {
      setIsGenerating(false);
      return; // pass
    }

    try {
      const newNodes = data.actions.reduce(
        (prev, curr) => {
          const prevNode = prev.at(-1);
          if (prevNode === undefined) throw new Error("Prev node not found.");

          const step = allSteps.find((step) => step.name === curr);
          if (step === undefined) throw new Error("Step not found.");

          const newNode: ActionNode = {
            id: generateId(),
            type: "actionNode",
            position: {
              x: 300 + prevNode.position.x,
              y: prevNode.position.y,
            },
            data: structuredClone(step),
          };
          newEdges.push({
            id: generateId(),
            source: newNode.id,
            target: prevNode.id,
          });
          return [...prev, newNode];
        },
        [triggerNode]
      );
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (e) {
      toast.error("Error generating workflow", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
    setIsGenerating(false);
  };

  return (
    <CardContent className="px-3 flex flex-col gap-2 w-72">
      <Textarea
        placeholder="Auto generate your workflow..."
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onGenerate();
          }
        }}
      />
      <Button onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate"}
      </Button>
    </CardContent>
  );
}

export default function Sidebar() {
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
      content: <StepsTab />,
    },
    {
      name: "Chat with AI!",
      icon: BotMessageSquare,
      tooltip: "Chat with AI!",
      content: <ChatTab />,
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
