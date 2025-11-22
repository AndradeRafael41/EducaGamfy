"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Progress } from "@/app/components/ui/progress"
import { AlertCircle, Users } from "lucide-react"

interface Student {
  id: string
  name: string
}

interface Classroom {
  id: string
  name: string
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

interface ViewTasksProps {
  tasks: TaskData[]
  classrooms: Classroom[]
  taskAssignments: TaskAssignment[]
}

export function ViewTasks({ tasks, classrooms, taskAssignments }: ViewTasksProps) {
  const getTaskStats = (taskId: string) => {
    const assignment = taskAssignments.find((a) => a.taskId === taskId)

    if (!assignment) {
      return null
    }

    // Obter salas que a tarefa foi designada
    const assignedClassrooms = classrooms.filter((c) => assignment.classroomIds.includes(c.id))

    // Contar quantos alunos fizeram a tarefa
    const studentsCompleted = Object.values(assignment.studentStatuses).filter((s) => s.completed).length
    const totalStudents = Object.keys(assignment.studentStatuses).length

    // Calcular média de acertos
    const completedStatuses = Object.values(assignment.studentStatuses).filter((s) => s.completed)
    const averageScore =
      completedStatuses.length > 0
        ? Math.round(completedStatuses.reduce((acc, s) => acc + s.score, 0) / completedStatuses.length)
        : 0

    return {
      classrooms: assignedClassrooms,
      studentsCompleted,
      totalStudents,
      averageScore,
      assignedDate: assignment.assignedDate,
    }
  }

  const tasksWithStats = tasks.map((task) => ({
    task,
    stats: getTaskStats(task.id),
  }))

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Estatísticas das Tarefas</CardTitle>
          <CardDescription className="text-muted-foreground">
            Visualize informações sobre tarefas criadas e designadas
          </CardDescription>
        </CardHeader>
      </Card>

      {tasks.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhuma tarefa criada ainda</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasksWithStats.map(({ task, stats }) => (
            <Card key={task.id} className="border-border bg-card hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-foreground text-lg">{task.taskName}</CardTitle>
                    {task.description && (
                      <CardDescription className="text-muted-foreground mt-1">{task.description}</CardDescription>
                    )}
                  </div>
                  {stats ? (
                    <Badge className="ml-2 bg-primary text-primary-foreground">Designada</Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-2 bg-muted text-foreground">
                      Não designada
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Criada em {new Date(task.date).toLocaleDateString("pt-BR")}
                    {task.dueDate && ` • Entrega: ${new Date(task.dueDate).toLocaleDateString("pt-BR")}`}
                  </div>

                  {stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Salas */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Salas Designadas</p>
                        <div className="space-y-1">
                          {stats.classrooms.map((classroom) => (
                            <div key={classroom.id} className="text-sm text-muted-foreground">
                              • {classroom.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Alunos que fizeram */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Alunos que Fizeram
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {stats.studentsCompleted}/{stats.totalStudents}
                        </p>
                        <Progress value={(stats.studentsCompleted / stats.totalStudents) * 100} className="h-2" />
                      </div>

                      {/* Média de acertos */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Média de Acertos</p>
                        <p className="text-2xl font-bold text-primary">{stats.averageScore}%</p>
                        <Progress value={stats.averageScore} className="h-2" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Esta tarefa ainda não foi designada a nenhuma sala
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
