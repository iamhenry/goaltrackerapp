"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Header } from "@/app/components/Header";

import { Checkbox } from "@/app/components/ui/checkbox";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress as ProgressBar } from "@/app/components/ui/progress";
import { TaskType, UserState } from "./types/task";
import TaskList from "@/app/components/ui/TaskList";
import TodoGenerator from "@/app/components/TodoGenerator";
import { Pencil, Save, Loader2 } from "lucide-react"; // Add Save icon
import { Plus } from "lucide-react"; // Add this import
import { cn } from "@/lib/utils";

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  const debouncedFunc = function (...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };

  debouncedFunc.cancel = function () {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
  };

  return debouncedFunc;
}

export default function Home() {
  const [userState, setUserState] = useState<UserState>({
    tasks: [],
    progress: 0,
    goalName: "", // Initialize with an empty string
  });
  const [newTodo, setNewTodo] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false); // Add this line
  const [editedGoalName, setEditedGoalName] = useState(userState.goalName);
  const [loadingGoal, setLoadingGoal] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const savedState = localStorage.getItem("userState");
    if (savedState) {
      setUserState(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      const saveToStorage = debounce(() => {
        localStorage.setItem("userState", JSON.stringify(userState));
      }, 500);
      saveToStorage();
      return () => {
        if (typeof saveToStorage.cancel === "function") {
          saveToStorage.cancel();
        }
      };
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

  const handleNewTasks = (newTasks: string[], goalText: string) => {
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
        goalName: goalText, // Set the goalName to the input text
      };
      // Save to localStorage immediately after updating state
      if (isClient) {
        localStorage.setItem("userState", JSON.stringify(newState));
      }
      return newState;
    });
    setIsGoalCreated(true);
  };

  const handleGoalSubmit = async (goal: string) => {
    setLoadingGoal(goal);
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

      const tasks = fullResponse
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => JSON.parse(line.slice(5)))
        .join("")
        .split("\n")
        .filter((line) => line.trim().match(/^[-*]\s/))
        .map((line) => line.trim().replace(/^[-*]\s/, ""));

      handleNewTasks(tasks, goal);
    } catch (error) {
      console.error("Error generating todos:", error);
    } finally {
      setLoadingGoal(null);
    }
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

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 py-8">
      <div className="w-[780px] bg-white rounded-lg shadow-md p-6">
        {userState.tasks.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
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
                      className="text-3xl font-bold mr-2"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGoalNameChange}
                    >
                      <Save size={16} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold">{userState.goalName}</h1>
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
            </div>
            <div className="w-full mb-4">
              <div className="flex justify-between mb-2">
                <span>{userState.progress}%</span>
                <span>100%</span>
              </div>
              <ProgressBar
                value={userState.progress}
                className={cn(
                  "w-full h-1",
                  "bg-[#E5E7EB] [&>div]:bg-[#1921FF]"
                )}
              />
            </div>
          </>
        )}
        {userState.tasks.length === 0 && (
          <>
            <TodoGenerator onNewTasks={handleNewTasks} />
            <div className="flex flex-col space-y-4 mb-6">
              {[
                { goal: "Speak Spanish in 3 months", icon: "language" },
                { goal: "Indie hacker in 3 months", icon: "savings" },
                { goal: "Learn to draw in 6 months", icon: "brush" },
              ].map(({ goal, icon }) => (
                <Button
                  key={goal}
                  variant="outline"
                  className="flex justify-between items-center p-10 h-28 text-left text-lg font-medium bg-white border border-[#D9D9D9] rounded-[20px] hover:bg-gray-50 transition-colors"
                  onClick={() => handleGoalSubmit(goal)}
                  disabled={loadingGoal !== null}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-4 flex items-center justify-center">
                      {icon === "language" ? (
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            opacity="0.3"
                            d="M16.0001 2.66663C23.3641 2.66663 29.3334 8.63596 29.3334 16C29.3334 23.364 23.3641 29.3333 16.0001 29.3333C8.63608 29.3333 2.66675 23.364 2.66675 16C2.66675 8.63596 8.63608 2.66663 16.0001 2.66663Z"
                            fill="#1921FF"
                          />
                          <path
                            d="M15.9999 5.33338C14.368 5.33209 12.7576 5.70582 11.2931 6.42573C9.82852 7.14563 8.54899 8.19245 7.55325 9.48538L7.33325 9.78005V12.0267C7.33325 13.6934 8.36659 15.1854 9.92659 15.772L10.1639 15.852L11.8839 16.3787C13.7146 16.9387 15.4973 15.4494 15.3199 13.584L15.2946 13.3907L15.0613 11.992C15.0097 11.6822 15.0692 11.3641 15.2292 11.0939C15.3892 10.8236 15.6395 10.6185 15.9359 10.5147L16.0799 10.4747L16.8959 10.288C17.3589 10.1822 17.796 9.98473 18.1814 9.70723C18.5668 9.42972 18.8927 9.07782 19.1399 8.6723C19.3871 8.26678 19.5506 7.81585 19.6206 7.34612C19.6907 6.8764 19.666 6.39739 19.5479 5.93738C18.4081 5.53621 17.2083 5.33196 15.9999 5.33338ZM18.6666 17.8667L16.5813 19.5347C16.5081 19.5933 16.448 19.6667 16.4051 19.75C16.3622 19.8334 16.3374 19.9249 16.3322 20.0185C16.327 20.1121 16.3417 20.2058 16.3752 20.2933C16.4087 20.3809 16.4603 20.4604 16.5266 20.5267L18.1786 22.1787C18.4986 22.4987 18.7319 22.896 18.8559 23.3307L19.0893 24.148C19.2853 24.8427 19.7826 25.412 20.4453 25.6987C21.7206 25.1125 22.8682 24.2812 23.8226 23.252L23.5106 20.7494C23.456 20.314 23.2948 19.8988 23.0413 19.5406C22.7877 19.1824 22.4497 18.8923 22.0573 18.696L20.0973 17.7147C19.8692 17.6006 19.6132 17.5543 19.3597 17.5812C19.1061 17.6081 18.8656 17.7072 18.6666 17.8667Z"
                            fill="#1921FF"
                          />
                        </svg>
                      ) : icon === "savings" ? (
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            opacity="0.3"
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M2.66675 16C2.66675 8.63596 8.63608 2.66663 16.0001 2.66663C23.3641 2.66663 29.3334 8.63596 29.3334 16C29.3334 23.364 23.3641 29.3333 16.0001 29.3333C8.63608 29.3333 2.66675 23.364 2.66675 16Z"
                            fill="#1921FF"
                          />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M11.5999 17.3333C11.7386 18.4747 12.0759 19.6213 12.6479 20.6107C13.4439 21.9853 14.7439 23.1173 16.5946 23.3347C18.4706 23.556 20.3773 22.6547 21.5279 21.1813C21.6356 21.0431 21.715 20.885 21.7615 20.7161C21.8081 20.5472 21.8209 20.3708 21.7992 20.197C21.7775 20.0231 21.7218 19.8552 21.6352 19.7029C21.5486 19.5506 21.4329 19.4169 21.2946 19.3093C20.6386 18.7973 19.8373 19.044 19.3479 19.6333C18.0839 21.16 15.9479 20.988 14.9559 19.2733C14.6221 18.6709 14.3977 18.0141 14.2933 17.3333H19.9999C20.3535 17.3333 20.6927 17.1928 20.9427 16.9428C21.1928 16.6927 21.3333 16.3536 21.3333 16C21.3333 15.6464 21.1928 15.3072 20.9427 15.0572C20.6927 14.8071 20.3535 14.6667 19.9999 14.6667H14.3279C14.4613 13.9773 14.6919 13.336 15.0079 12.8093C15.9546 11.2293 18.1199 10.8213 19.3319 12.356C19.8013 12.9493 20.5986 13.2173 21.2626 12.732C21.5474 12.5225 21.7373 12.2084 21.7906 11.8588C21.8439 11.5092 21.7561 11.1528 21.5466 10.868C20.4199 9.32666 18.7493 8.57332 16.8386 8.73599C14.9279 8.89999 13.5626 10.0333 12.7213 11.4373C12.1399 12.4067 11.7839 13.5333 11.6239 14.6667H10.6666C10.313 14.6667 9.97382 14.8071 9.72378 15.0572C9.47373 15.3072 9.33325 15.6464 9.33325 16C9.33325 16.3536 9.47373 16.6927 9.72378 16.9428C9.97382 17.1928 10.313 17.3333 10.6666 17.3333H11.5999Z"
                            fill="#1921FF"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            opacity="0.3"
                            d="M30.6667 9.33336C28.3165 9.20405 25.9849 9.81493 24 11.08C23.52 10.5334 23.0267 9.98669 22.5067 9.46669L22.12 9.10669L22.3067 8.94669C22.9588 8.38697 23.4234 7.64071 23.638 6.8086C23.8526 5.9765 23.8068 5.0986 23.5067 4.29336C23.0733 3.38426 22.3852 2.6206 21.526 2.09514C20.6668 1.56968 19.6735 1.30504 18.6667 1.33336V4.00002C19.1411 3.99342 19.6087 4.1135 20.0212 4.34788C20.4337 4.58226 20.7762 4.92245 21.0134 5.33336C21.24 5.86669 21.0134 6.45336 20.3867 7.08002L20.0801 7.36002C18.6893 6.20116 17.1625 5.21612 15.5334 4.42669C12.16 2.90669 10.4267 3.61336 9.57338 4.42669C9.31336 4.68734 9.10523 4.99502 8.96005 5.33336L8.72005 6.04002L6.80005 11.8267C8.32005 15.6134 12 22.3467 20 25.2534L26.6667 23.04C26.8915 22.9563 27.0896 22.8135 27.24 22.6267L27.52 22.3867C29.4267 20.4667 28.2 16.7734 25.64 13.1867C27.1601 12.2996 28.9104 11.8864 30.6667 12V9.33336Z"
                            fill="#1921FF"
                          />
                          <path
                            d="M5.86656 14.6666L2.89323 23.6C1.96923 26.424 4.06923 29.3266 7.0399 29.3333C7.49354 29.3289 7.94361 29.2524 8.37323 29.1066L17.0666 26.2133C12.1601 23.7075 8.22168 19.6472 5.86656 14.6666ZM25.6132 20.4933H25.5332C24.6132 20.9866 20.7999 19.7333 16.4799 15.4133C16.0266 14.96 15.5999 14.52 15.2132 14.08C15.0799 13.9333 14.9599 13.7733 14.8266 13.6133L14.1199 12.76L13.7466 12.24C13.5599 11.9866 13.3732 11.7333 13.2132 11.4933C13.0532 11.2533 12.9999 11.1466 12.8932 10.9733C12.7866 10.8 12.5999 10.52 12.4799 10.2933C12.3599 10.0666 12.3066 9.97331 12.2266 9.79998C12.1466 9.62664 11.9999 9.42664 11.9199 9.23998C11.8399 9.05331 11.7999 8.93331 11.7332 8.78664C11.6666 8.63998 11.5866 8.42664 11.5332 8.25331C11.4799 8.07998 11.4666 7.99998 11.4399 7.86664C11.4132 7.73331 11.3599 7.54664 11.3332 7.41331C11.3268 7.30674 11.3268 7.19988 11.3332 7.09331C11.3201 6.97813 11.3201 6.86183 11.3332 6.74664L11.4799 6.33331C11.7066 6.09331 12.6932 6.02664 14.4532 6.82664C15.6292 7.39198 16.7426 8.07998 17.7732 8.87998C17.2106 9.12798 16.6132 9.27998 15.9999 9.33331V12C17.4164 11.9196 18.7908 11.489 19.9999 10.7466L20.6532 11.36C21.2399 11.9333 21.7599 12.5066 22.2399 13.0533C21.436 14.4242 21.1166 16.0256 21.3332 17.6L23.9999 17.08C23.9098 16.5773 23.9098 16.0626 23.9999 15.56C25.7199 18.1866 26.0399 20.08 25.6132 20.4933Z"
                            fill="#1921FF"
                          />
                        </svg>
                      )}
                    </div>
                    <span>{goal}</span>
                  </div>
                  {loadingGoal === goal ? (
                    <Loader2 className="h-6 w-6 animate-spin text-black" />
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="#000000"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  )}
                </Button>
              ))}
            </div>
          </>
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
