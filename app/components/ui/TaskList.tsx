import React from "react";
import { TaskType } from "@/app/types/task";
import Task from "./Task";
import { motion, Reorder } from "framer-motion";

interface TaskListProps {
  tasks: TaskType[];
  onEditTask: (id: string, task: TaskType) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onReorderTasks: (newTasks: TaskType[]) => void;
}

const TaskItem: React.FC<{
  task: TaskType;
  onEdit: (updatedTask: TaskType) => void;
  onDelete: () => void;
  onToggle: () => void;
}> = ({ task, onEdit, onDelete, onToggle }) => {
  return (
    <motion.div
      className={task.title.includes("Day") ? "" : "ml-6"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Task
        task={task}
        onDelete={onDelete}
        onToggle={onToggle}
        onEdit={onEdit}
      />
    </motion.div>
  );
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onReorderTasks,
}) => {
  return (
    <Reorder.Group axis="y" values={tasks} onReorder={onReorderTasks} as="div">
      {tasks.map((task, index) => (
        <Reorder.Item key={task.id} value={task} as="div">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.1, delay: index * 0.02 }}
          >
            <TaskItem
              task={task}
              onEdit={(updatedTask) => {
                if (updatedTask.title.trim() === "") {
                  onDeleteTask(task.id);
                } else {
                  onEditTask(task.id, updatedTask);
                }
              }}
              onDelete={() => onDeleteTask(task.id)}
              onToggle={() => onToggleComplete(task.id)}
            />
          </motion.div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};

export default TaskList;
