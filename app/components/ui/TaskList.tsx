import React, { useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Task from "./Task";
import { TaskType } from "../../types/task";

interface TaskListProps {
  tasks: TaskType[];
  onEditTask: (id: string, task: TaskType) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onReorderTasks: (newTasks: TaskType[]) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onReorderTasks,
}) => {
  const moveTask = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const newTasks = [...tasks];
      const draggedTask = newTasks[dragIndex];
      newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, draggedTask);
      onReorderTasks(newTasks);
    },
    [tasks, onReorderTasks]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <Task
            key={task.id}
            task={task}
            index={index}
            moveTask={moveTask}
            onDelete={() => onDeleteTask(task.id)}
            onToggle={() => onToggleComplete(task.id)}
            onEdit={(updatedTask) => onEditTask(task.id, updatedTask)}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default TaskList;
