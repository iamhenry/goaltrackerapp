import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TodoGeneratorProps {
  onNewTasks: (tasks: string[]) => void;
}

const TodoGenerator: React.FC<TodoGeneratorProps> = ({ onNewTasks }) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate todos");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let tasks: string[] = [];

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = JSON.parse(line.slice(6));
            tasks.push(content);
          }
        }
      }

      onNewTasks(tasks);
    } catch (error) {
      console.error("Error generating todos:", error);
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  return (
    <div className="mb-4">
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a goal and accomplish days"
        className="mb-2"
      />
      <Button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Create Goal"}
      </Button>
    </div>
  );
};

export default TodoGenerator;
