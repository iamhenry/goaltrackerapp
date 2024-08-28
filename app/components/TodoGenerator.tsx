import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TodoGeneratorProps {
  onNewTasks: (tasks: string[]) => void;
}

const TodoGenerator: React.FC<TodoGeneratorProps> = ({ onNewTasks }) => {
  const [goal, setGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
      onNewTasks(tasks);
    } catch (error) {
      console.error("Error generating todos:", error);
    } finally {
      setIsGenerating(false);
      setGoal("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Enter your goal and due date..."
        disabled={isGenerating}
        className="w-full border border-gray-200 rounded-md"
      />
      <Button type="submit" disabled={isGenerating} className="w-full">
        {isGenerating ? "Generating..." : "Create Goal"}
      </Button>
    </form>
  );
};

export default TodoGenerator;
