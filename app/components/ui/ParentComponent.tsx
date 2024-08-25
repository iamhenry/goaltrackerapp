import React, { useState } from "react";
import TaskList from "./TaskList";
import TodoGenerator from "./TodoGenerator"; // Add this import
import { TaskType } from "../../types/task";

const ParentComponent: React.FC = () => {
  const [tasks, setTasks] = useState<TaskType[]>([
    {
      id: "1",
      title: "Task 1",
      description: "Description 1",
      completed: false,
    },
    { id: "2", title: "Task 2", description: "Description 2", completed: true },
  ]);

  const handleEditTask = (id: string, updatedTask: TaskType) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, ...updatedTask } : task))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleReorderTasks = (newTasks: TaskType[]) => {
    setTasks(newTasks);
  };

  // Add this new function
  const handleGenerateTasks = async (prompt: string) => {
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

      const newTasks: TaskType[] = await response.json();
      setTasks([...tasks, ...newTasks]);
    } catch (error) {
      console.error("Error generating todos:", error);
    }
  };

  return (
    <>
      <TodoGenerator onGenerateTasks={handleGenerateTasks} />
      <TaskList
        tasks={tasks}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
        onReorderTasks={handleReorderTasks}
      />
    </>
  );
};

export default ParentComponent;
