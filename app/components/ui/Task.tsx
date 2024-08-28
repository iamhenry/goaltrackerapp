import React, { useState, useRef, useEffect } from "react";
import { Checkbox } from "./checkbox";
import { Button } from "./button";
import { Input } from "./input";
import { Trash } from "lucide-react";
import { TaskType } from "@/app/types/task";

interface TaskProps {
  task: TaskType;
  onDelete: () => void;
  onToggle: () => void;
  onEdit: (updatedTask: TaskType) => void;
}

const Task: React.FC<TaskProps> = ({ task, onDelete, onToggle, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onEdit({ ...task, title: editedTitle });
    setIsEditing(false);
  };

  const handleClick = () => {
    if (!task.completed) {
      setIsEditing(true);
    }
  };

  return (
    <div className="flex items-center space-x-2 w-full">
      <Checkbox checked={task.completed} onCheckedChange={onToggle} />
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleSave}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="flex-grow"
        />
      ) : (
        <span
          className={`flex-grow cursor-pointer ${
            task.completed ? "line-through" : ""
          }`}
          onClick={handleClick}
        >
          {task.title}
        </span>
      )}
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash size={16} />
      </Button>
    </div>
  );
};

export default Task;

// Add new function to generate and stream todo items
export async function* generateTodoItems(prompt: string) {
  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  });

  const stream = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Generate concise answer`,
      },
      { role: "user", content: prompt },
    ],
    model: "llama-3.1-70b-versatile",
    stream: true,
  });

  for await (const chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
      yield chunk.choices[0].delta.content;
    }
  }
}
