"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { CreateTask } from "./create-task"
import { AssignTask } from "./assign-task"
import { ViewTasks } from "./view-tasks"
import { ClipboardCheck, Share2 } from "lucide-react"

interface Student {
  id: string
  name: string
  avatar: string
  level: number
  xp: number
  medals: number
}

interface Classroom {
  id: string
  name: string
  grade: string
  studentCount: number
  students: Student[]
}

interface TaskData {
  id: string
  taskName: string
  description: string
  date: string
  dueDate?: string
}

interface TaskAssignment {
  taskId: string
  classroomIds: string[]
  studentStatuses: Record<string, { studentId: string; completed: boolean; score: number }>
  assignedDate: string
}

interface TaskTabsProps {
  classrooms: Classroom[]
}

export function TaskTabs({ classrooms }: TaskTabsProps) {
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([])

  const handleTaskCreated = (task: TaskData) => {
    setTasks([...tasks, task])
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId))
    setTaskAssignments(taskAssignments.filter((a) => a.taskId !== taskId))
  }

  const handleTaskAssigned = (taskId: string, classroomIds: string[], studentStatuses: Record<string, any>) => {
    const newAssignment: TaskAssignment = {
      taskId,
      classroomIds,
      studentStatuses,
      assignedDate: new Date().toISOString(),
    }
    setTaskAssignments([...taskAssignments, newAssignment])
  }

  return (
    <Tabs defaultValue="create" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-muted border border-border">
        <TabsTrigger value="create" className="text-sm">
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Criar Tarefa
        </TabsTrigger>
        <TabsTrigger value="assign" className="text-sm">
          <Share2 className="h-4 w-4 mr-2" />
          Atribuir Tarefa
        </TabsTrigger>
        <TabsTrigger value="view" className="text-sm">
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Tarefas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="mt-6">
        <CreateTask onTaskCreated={handleTaskCreated} tasks={tasks} onTaskDeleted={handleTaskDeleted} />
      </TabsContent>

      <TabsContent value="assign" className="mt-6">
        <AssignTask classrooms={classrooms} tasks={tasks} onTaskAssigned={handleTaskAssigned} />
      </TabsContent>

      <TabsContent value="view" className="mt-6">
        <ViewTasks tasks={tasks} classrooms={classrooms} taskAssignments={taskAssignments} />
      </TabsContent>
    </Tabs>
  )
}
