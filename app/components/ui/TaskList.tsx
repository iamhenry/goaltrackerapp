import React, { useCallback } from "react";
import { TaskType } from "@/app/types/task";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Task from "./Task";

interface TaskListProps {
  tasks: TaskType[];
  onEditTask: (id: string, task: TaskType) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onReorderTasks: (newTasks: TaskType[]) => void;
}

interface DraggableTaskProps {
  task: TaskType;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (updatedTask: TaskType) => void;
  onDelete: () => void;
  onToggle: () => void;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  index,
  moveTask,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "TASK",
    hover(item: { index: number }) {
      if (item.index !== index) {
        moveTask(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`mb-2 ${task.title.includes("Day") ? "" : "ml-6"}`}
    >
      <Task
        task={task}
        onDelete={onDelete}
        onToggle={onToggle}
        onEdit={onEdit}
      />
    </div>
  );
};

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
          <DraggableTask
            key={task.id}
            task={task}
            index={index}
            moveTask={moveTask}
            onEdit={(updatedTask) => onEditTask(task.id, updatedTask)}
            onDelete={() => onDeleteTask(task.id)}
            onToggle={() => onToggleComplete(task.id)}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default TaskList;
