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
import { Pencil, Save } from "lucide-react"; // Add Save icon
import { Plus } from "lucide-react"; // Add this import

export default function Home() {
  const [userState, setUserState] = useState<UserState>({
    tasks: [],
    progress: 0,
    goalName: "Todo App", // Add this line
  });
  const [newTodo, setNewTodo] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false); // Add this line
  const [editedGoalName, setEditedGoalName] = useState(userState.goalName);

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
    setUserState((prevState) => {
      const newState = {
        ...prevState,
        tasks: [...prevState.tasks, ...updatedTasks],
        progress: calculateProgress([...prevState.tasks, ...updatedTasks]),
      };
      // Save to localStorage immediately after updating state
      if (isClient) {
        localStorage.setItem("userState", JSON.stringify(newState));
      }
      return newState;
    });
    setIsGoalCreated(true);
  };

  const handleGoalNameChange = () => {
    if (editedGoalName.trim() !== "") {
      setUserState((prevState) => ({
        ...prevState,
        goalName: editedGoalName,
      }));
      setIsEditingGoal(false);
    }
  };

  const addEmptyTask = () => {
    const newTask: TaskType = {
      id: String(Date.now()),
      title: "",
      description: "",
      completed: false,
    };
    setUserState((prevState) => ({
      ...prevState,
      tasks: [...prevState.tasks, newTask],
    }));
  };

  const handleEditTask = (id: string, updatedTask: TaskType) => {
    if (updatedTask.title.trim() === "") {
      handleDeleteTask(id);
    } else {
      const newTasks = userState.tasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      );
      setUserState((prevState) => ({
        ...prevState,
        tasks: newTasks,
        progress: calculateProgress(newTasks),
      }));
    }
  };

  const handleDeleteTask = (id: string) => {
    const newTasks = userState.tasks.filter((task) => task.id !== id);
    setUserState((prevState) => ({
      ...prevState,
      tasks: newTasks,
      progress: calculateProgress(newTasks),
    }));
  };

  if (!isClient) {
    return null; // or a loading spinner
  }
  // tets
  return (
    <div className="flex justify-center min-h-screen bg-gray-100 py-8">
      <div className="w-[780px] bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center mb-6">
          {isEditingGoal ? (
            <div className="flex items-center">
              <Input
                value={editedGoalName}
                onChange={(e) => setEditedGoalName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleGoalNameChange();
                  }
                }}
                className="text-3xl font-bold text-center mr-2"
                autoFocus
              />
              <Button variant="ghost" size="sm" onClick={handleGoalNameChange}>
                <Save size={16} />
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-center">
                {userState.goalName}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditedGoalName(userState.goalName);
                  setIsEditingGoal(true);
                }}
                className="ml-2"
              >
                <Pencil size={16} />
              </Button>
            </>
          )}
        </div>
        <div className="w-full mb-4">
          <ProgressBar value={userState.progress} className="w-full" />
          <p className="text-center mt-2">{userState.progress}% completed</p>
        </div>
        {userState.tasks.length === 0 && (
          <TodoGenerator onNewTasks={handleNewTasks} />
        )}
        <TaskList
          tasks={userState.tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={toggleTodo}
          onReorderTasks={handleReorderTasks}
        />
        {userState.tasks.length > 0 && (
          <Button
            variant="ghost"
            className="w-full mt-4 text-gray-500 hover:text-gray-700 flex items-center justify-start"
            onClick={addEmptyTask}
          >
            <Plus size={20} className="mr-2" />
            Add task...
          </Button>
        )}
      </div>
    </div>
  );
}
