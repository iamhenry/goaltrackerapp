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
  const [isEditing, setIsEditing] = useState(task.title === "");
  const [editedTitle, setEditedTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);
  const clickTarget = useRef<"checkbox" | "text" | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editedTitle.trim() === "") {
      onDelete(); // Delete the task if it's empty
    } else {
      onEdit({ ...task, title: editedTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartTime.current = Date.now();
    setIsDragging(false);
    if ((e.target as HTMLElement).closest(".checkbox-wrapper")) {
      clickTarget.current = "checkbox";
    } else {
      clickTarget.current = "text";
    }
  };

  const handleMouseUp = () => {
    const dragDuration = Date.now() - dragStartTime.current;
    if (dragDuration < 200 && !isDragging && clickTarget.current === "text") {
      handleClick();
    }
    setIsDragging(false);
    clickTarget.current = null;
  };

  const handleClick = () => {
    if (!task.completed) {
      setIsEditing(true);
    }
  };

  return (
    <div
      className="flex items-center space-x-2 w-full group hover:bg-gray-100 rounded-xl transition-colors duration-200 px-3 py-2"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={() => setIsDragging(true)}
      onTouchStart={handleMouseDown as any}
      onTouchEnd={handleMouseUp}
      onTouchMove={() => setIsDragging(true)}
    >
      <div className="checkbox-wrapper">
        <Checkbox checked={task.completed} onCheckedChange={onToggle} />
      </div>
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleSave}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="flex-grow text-base"
          placeholder="Enter task..."
        />
      ) : (
        <span
          className={`flex-grow cursor-pointer ${
            task.completed ? "line-through" : ""
          } text-[#242424] group-hover:text-[#242424] text-base`}
        >
          {task.title}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
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
