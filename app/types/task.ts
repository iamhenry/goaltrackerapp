export interface TaskType {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  // Add any other properties your tasks have
}

export interface UserState {
  tasks: TaskType[];
  progress: number;
  goalName: string;
}