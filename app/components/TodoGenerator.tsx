import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TodoGeneratorProps {
  onNewTasks: (tasks: string[], goalText: string) => void;
}

const TodoGenerator: React.FC<TodoGeneratorProps> = ({ onNewTasks }) => {
  const [goal, setGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: goal }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate todos");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;
      }

      // Process the full response to extract tasks
      const tasks = fullResponse
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => JSON.parse(line.slice(5)))
        .join("")
        .split("\n")
        .filter((line) => line.trim().match(/^[-*]\s/))
        .map((line) => line.trim().replace(/^[-*]\s/, ""));

      console.log("Generated tasks:", tasks);
      onNewTasks(tasks, goal);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error generating todos:", error);
    } finally {
      setIsGenerating(false);
      setGoal("");
    }
  };

  if (isSubmitted) {
    return null; // Return null to hide the component after submission
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-12">
      <div className="relative w-full">
        <Input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter a goal and due date..."
          disabled={isGenerating}
          className="w-full border border-gray-200 rounded-full pr-32 h-14"
        />
        <Button
          type="submit"
          disabled={isGenerating}
          className="absolute right-1 top-1 bottom-1 rounded-full h-12 px-4 bg-[#1921FF] hover:bg-[#1921FF]/90 text-white"
        >
          {isGenerating ? "Generating..." : "Create Goal"}
        </Button>
      </div>
    </form>
  );
};

export default TodoGenerator;
