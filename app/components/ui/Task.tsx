import React, { useRef, useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { TaskType } from "../../types/task";
import { Card, CardContent } from "./card";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Button } from "./button";
import Groq from "groq-sdk";

interface TaskProps {
  task: TaskType;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (task: TaskType) => void;
  onDelete: () => void;
  onToggle: () => void;
}

const Task: React.FC<TaskProps> = ({
  task,
  index,
  moveTask,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: "task",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "task",
    item: () => {
      return { id: task.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      <Card className="mb-2">
        <CardContent className="flex items-center p-4">
          <div className="drag-handle mr-2">☰</div>
          <Checkbox
            checked={task.completed}
            onCheckedChange={onToggle}
            className="mr-4"
          />
          <Input
            value={task.title}
            onChange={(e) => onEdit({ ...task, title: e.target.value })}
            className={`flex-grow border-none ${task.completed ? "line-through" : ""}`}
          />
          <Button onClick={onDelete} variant="destructive" className="ml-2">
            Delete
          </Button>
        </CardContent>
      </Card>
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
