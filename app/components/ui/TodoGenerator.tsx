import React, { useState } from "react";

interface TodoGeneratorProps {
  onGenerateTasks: (prompt: string) => void;
}

const TodoGenerator: React.FC<TodoGeneratorProps> = ({ onGenerateTasks }) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateTasks(prompt);
    setPrompt("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt to generate tasks"
      />
      <button type="submit">Create</button>
    </form>
  );
};

export default TodoGenerator;
