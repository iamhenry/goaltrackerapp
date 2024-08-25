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
      <Card>
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
            className={`flex-grow ${task.completed ? "line-through" : ""}`}
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
        content: `<think_step_by_step>
Create work back time line for learning to draw cartoons. Break up goal into detailed smaller actionable tasks and subtasks. Use SMART goals framework to guide you in creating tasks/subtasks
</think_step_by_step>

- ensure to start with day 1 
- Split into individual days 
- ensure output format is markdown codeblock as todo items 
- only output the code. exclude any additional text

# Output Example

### Example 1
- [ ] **Day 1: Set Up** 
- [ ] Define personal goals for learning to draw cartoons (SMART: Specific, Measurable, Achievable, Relevant, Time-bound) 
- [ ] Gather basic drawing supplies (pencils, erasers, sketchbook) 
- [ ] Create a dedicated drawing workspace 

- [ ] **Day 2: Basic Drawing Skills** 
- [ ] Watch tutorials on basic drawing techniques (lines, shapes) 
- [ ] Practice drawing basic shapes (circles, squares, triangles) 
- [ ] Complete 30-minute practice session focusing on line control 

- [ ] **Day 3: Understanding Cartoon Style** 
- [ ] Research different cartoon styles (classic, modern, anime) 
- [ ] Choose a cartoon style to focus on 
- [ ] Create a mood board with examples of chosen style
### Example 2
- [ ] **Day 1: Assess and Plan** 
- [ ] Research and select a marathon training plan that fits a 14-day timeline 
- [ ] Set specific milestones for each training day 
- [ ] Purchase or confirm running gear (shoes, clothes) 
- [ ] Create a detailed training calendar 

- [ ] **Day 2: Start Training Plan** 
- [ ] Complete the first workout of the chosen plan (e.g., 3 miles run) 
- [ ] Measure and record initial statistics (distance, time, pace) 
- [ ] Set up a running log or app to track progress 

- [ ] **Day 3: Rest or Cross-Training** 
- [ ] Perform a 30-minute low-impact cross-training activity (e.g., swimming) 
- [ ] Complete a 15-minute stretching and flexibility routine`,
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
