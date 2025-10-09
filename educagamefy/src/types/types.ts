export type UserRole = "STUDENT" | "TEACHER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Student {
  id: number;
  class_id?: number | null;
  level: number;
  total_points: number;
  level_progress: number; // 0-100
  user: User;
}

export interface Teacher {
  id: number;
  subject?: string | null;
  school?: string | null;
  user: User;
}

export interface Class {
  id: number;
  title: string;
  teacher_id: number;
  teacher?: Teacher;
}

export interface Task {
  id: number;
  teacher_id: number;
  class_id: number;
  title: string;
  description?: string | null;
  max_points: number;
  created_at?: string | null;
  due_date?: string | null;
  link?: string | null;
}

export interface TaskSubmission {
  id: number;
  task_id: number;
  student_id: number;
  points: number;
  submitted_at?: string | null;
  status: string;
  link?: string | null;
}

export interface Reward {
  id: number;
  teacher_id: number;
  name: string;
  description?: string | null;
  cost_points: number;
}

export interface RewardRedemption {
  id: number;
  reward_id: number;
  student_id: number;
  redeemed_at?: string | null;
}

export interface Badge {
  id: number;
  name: string;
  description?: string | null;
  criteria?: string | null;
}

export interface StudentBadge {
  student_id: number;
  badge_id: number;
  earned_at?: string | null;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  sent_at?: string | null;
  read: boolean;
}
