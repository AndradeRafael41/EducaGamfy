"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { AlertCircle, ChevronRight } from "lucide-react"

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

interface StudentTaskStatus {
  studentId: string
  completed: boolean
  score: number
}

interface TaskData {
  id: string
  taskName: string
  description: string
  date: string
  dueDate?: string
}

interface AssignTaskProps {
  classrooms: Classroom[]
  tasks: TaskData[]
  onTaskAssigned?: (taskId: string, classroomIds: string[], studentStatuses: Record<string, any>) => void
}

export function AssignTask({ classrooms, tasks, onTaskAssigned }: AssignTaskProps) {
  const [selectedTask, setSelectedTask] = useState<string>("")
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([])
  const [studentStatuses, setStudentStatuses] = useState<Record<string, StudentTaskStatus>>({})
  const [searchQuery, setSearchQuery] = useState("")

  const handleClassroomToggle = (classroomId: string) => {
    setSelectedClassrooms((prev) =>
      prev.includes(classroomId) ? prev.filter((id) => id !== classroomId) : [...prev, classroomId],
    )
  }

  const getSelectedStudents = () => {
    return classrooms
      .filter((c) => selectedClassrooms.includes(c.id))
      .flatMap((c) => c.students)
      .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const handleStudentStatusChange = (studentId: string, field: "completed" | "score", value: any) => {
    setStudentStatuses((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        completed: prev[studentId]?.completed ?? true,
        score: prev[studentId]?.score ?? 100,
        [field]: value,
      },
    }))
  }

  const toggleAllStudents = (check: boolean) => {
    const students = getSelectedStudents()
    students.forEach((student) => {
      handleStudentStatusChange(student.id, "completed", check)
    })
  }

  const selectedStudents = getSelectedStudents()
  const currentTask = tasks.find((t) => t.id === selectedTask)

  const handleAssignTask = () => {
    if (onTaskAssigned) {
      onTaskAssigned(selectedTask, selectedClassrooms, studentStatuses)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Selecionar Tarefa</CardTitle>
          <CardDescription className="text-muted-foreground">Escolha a tarefa que deseja atribuir</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhuma tarefa criada ainda. Crie uma tarefa na aba anterior.</p>
            </div>
          ) : (
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger className="w-full bg-input border-border text-foreground">
                <SelectValue placeholder="Selecione uma tarefa..." />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    <div className="flex items-center gap-2">
                      <span>{task.taskName}</span>
                      <span className="text-xs text-muted-foreground">
                        ({new Date(task.date).toLocaleDateString("pt-BR")})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedTask && currentTask && (
        <>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">{currentTask.taskName}</CardTitle>
              <CardDescription className="text-muted-foreground">{currentTask.description}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Selecionar Salas</CardTitle>
              <CardDescription className="text-muted-foreground">
                Escolha as sala(s) para atribuir a tarefa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => handleClassroomToggle(classroom.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedClassrooms.includes(classroom.id)}
                        onCheckedChange={() => handleClassroomToggle(classroom.id)}
                      />
                      <div>
                        <p className="font-semibold text-foreground">{classroom.name}</p>
                        <p className="text-sm text-muted-foreground">{classroom.grade}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-muted text-foreground">
                      {classroom.studentCount} alunos
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedClassrooms.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Alunos das Salas Selecionadas</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {selectedStudents.length} aluno(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-foreground">
                      Buscar Aluno
                    </Label>
                    <Input
                      id="search"
                      placeholder="Digite o nome do aluno..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  {selectedStudents.length > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedStudents.every((s) => studentStatuses[s.id]?.completed ?? true)}
                          onCheckedChange={(checked) => toggleAllStudents(checked as boolean)}
                        />
                        <span className="text-sm font-medium text-foreground">Selecionar Todos</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {selectedStudents.filter((s) => studentStatuses[s.id]?.completed ?? true).length}/
                        {selectedStudents.length}
                      </span>
                    </div>
                  )}

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedStudents.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Nenhum aluno encontrado</p>
                      </div>
                    ) : (
                      selectedStudents.map((student) => {
                        const status = studentStatuses[student.id] ?? {
                          studentId: student.id,
                          completed: true,
                          score: 100,
                        }
                        return (
                          <div
                            key={student.id}
                            className="p-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <Checkbox
                                  checked={status.completed}
                                  onCheckedChange={(checked) =>
                                    handleStudentStatusChange(student.id, "completed", checked)
                                  }
                                />
                                <Avatar className="h-10 w-10 border-2 border-primary">
                                  <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    {student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-foreground">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">Nível {student.level}</p>
                                </div>
                              </div>
                              <Badge
                                variant={status.completed ? "default" : "secondary"}
                                className="bg-muted text-foreground"
                              >
                                {status.score}%
                              </Badge>
                            </div>

                            {status.completed && (
                              <div className="ml-14 space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Porcentagem de Acertos: {status.score}%
                                </Label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={status.score}
                                  onChange={(e) =>
                                    handleStudentStatusChange(student.id, "score", Number(e.target.value))
                                  }
                                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedClassrooms.length > 0 && selectedStudents.length > 0 && (
            <Button
              onClick={handleAssignTask}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
            >
              <ChevronRight className="h-4 w-4 mr-2" />
              Atribuir Tarefa aos Alunos
            </Button>
          )}
        </>
      )}
    </div>
  )
}
