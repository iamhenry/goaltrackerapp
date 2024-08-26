"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress as ProgressBar } from "@/app/components/ui/progress";
import { TaskType, UserState } from "./types/task";
import TaskList from "@/app/components/ui/TaskList";
import TodoGenerator from "@/app/components/TodoGenerator";

export default function Home() {
  const [userState, setUserState] = useState<UserState>({
    tasks: [],
    progress: 0,
  });
  const [newTodo, setNewTodo] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedState = localStorage.getItem("userState");
    if (savedState) {
      setUserState(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("userState", JSON.stringify(userState));
    }
  }, [userState, isClient]);

  const calculateProgress = (tasks: TaskType[]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTask: TaskType = {
        id: String(Date.now()), // Ensure id is a string
        title: newTodo,
        description: "",
        completed: false,
      };
      setUserState((prevState) => ({
        ...prevState,
        tasks: [...prevState.tasks, newTask],
        progress: calculateProgress([...prevState.tasks, newTask]),
      }));
      setNewTodo("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const toggleTodo = (id: string) => {
    setUserState((prevState) => {
      const updatedTasks = prevState.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      return {
        ...prevState,
        tasks: updatedTasks,
        progress: calculateProgress(updatedTasks),
      };
    });
  };

  const renameTodo = (id: string, newText: string) => {
    setUserState((prevState) => {
      const updatedTasks = prevState.tasks.map((task) =>
        task.id === id ? { ...task, title: newText } : task
      );
      return {
        ...prevState,
        tasks: updatedTasks,
      };
    });
  };

  const handleReorderTasks = (newTasks: TaskType[]) => {
    setUserState((prevState) => ({
      ...prevState,
      tasks: newTasks,
      progress: calculateProgress(newTasks),
    }));
  };

  const handleNewTasks = (newTasks: string[]) => {
    const updatedTasks = newTasks.map((task) => ({
      id: String(Date.now() + Math.random()),
      title: task,
      description: "",
      completed: false,
    }));
    setUserState((prevState) => ({
      ...prevState,
      tasks: [...prevState.tasks, ...updatedTasks],
      progress: calculateProgress([...prevState.tasks, ...updatedTasks]),
    }));
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-8">
      <div className="w-[600px] bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Todo App</h1>
        <div className="w-full max-w-sm mb-4">
          <ProgressBar value={userState.progress} className="w-full" />
          <p className="text-center mt-2">{userState.progress}% completed</p>
        </div>
        <TodoGenerator onNewTasks={handleNewTasks} />
        <TaskList
          tasks={userState.tasks}
          onEditTask={(id, updatedTask) => {
            const newTasks = userState.tasks.map((task) =>
              task.id === id ? { ...task, ...updatedTask } : task
            );
            setUserState((prevState) => ({
              ...prevState,
              tasks: newTasks,
              progress: calculateProgress(newTasks),
            }));
          }}
          onDeleteTask={(id) => {
            const newTasks = userState.tasks.filter((task) => task.id !== id);
            setUserState((prevState) => ({
              ...prevState,
              tasks: newTasks,
              progress: calculateProgress(newTasks),
            }));
          }}
          onToggleComplete={toggleTodo}
          onReorderTasks={handleReorderTasks}
        />
      </div>
    </div>
  );
}
