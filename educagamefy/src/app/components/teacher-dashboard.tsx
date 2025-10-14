"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Users, Plus, Eye, LogOut, BookOpen, TrendingUp, ClipboardCheck } from "lucide-react"

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

interface Task {
  id: string
  studentId: string
  studentName: string
  classroomId: string
  classroomName: string
  taskName: string
  date: string
  completed: boolean
  score: number
}

export default function TeacherDashboard() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([
    {
      id: "1",
      name: "Turma A",
      grade: "5º Ano",
      studentCount: 25,
      students: [
        { id: "1", name: "Maria Silva", avatar: "/happy-student-avatar.jpg", level: 12, xp: 2450, medals: 8 },
        { id: "2", name: "João Santos", avatar: "/happy-student-avatar.jpg", level: 10, xp: 1980, medals: 6 },
        { id: "3", name: "Ana Costa", avatar: "/happy-student-avatar.jpg", level: 15, xp: 3200, medals: 12 },
      ],
    },
    {
      id: "2",
      name: "Turma B",
      grade: "5º Ano",
      studentCount: 28,
      students: [
        { id: "4", name: "Pedro Oliveira", avatar: "/happy-student-avatar.jpg", level: 11, xp: 2100, medals: 7 },
        { id: "5", name: "Lucas Ferreira", avatar: "/happy-student-avatar.jpg", level: 13, xp: 2650, medals: 9 },
      ],
    },
    {
      id: "3",
      name: "Turma C",
      grade: "4º Ano",
      studentCount: 22,
      students: [
        { id: "6", name: "Sofia Almeida", avatar: "/happy-student-avatar.jpg", level: 9, xp: 1750, medals: 5 },
      ],
    },
  ])

  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")
  const [newStudentEmail, setNewStudentEmail] = useState("")

  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [taskForm, setTaskForm] = useState({
    classroomId: "",
    studentId: "",
    taskName: "",
    date: "",
    completed: false,
    score: 0,
  })

  const handleLogout = () => {
    console.log("Logout clicked")
  }

  const handleAddStudent = () => {
    if (selectedClassroom && newStudentName && newStudentEmail) {
      console.log("Adding student:", newStudentName, newStudentEmail, "to", selectedClassroom.name)
      setIsAddStudentOpen(false)
      setNewStudentName("")
      setNewStudentEmail("")
    }
  }

  const handleViewProfile = (student: Student) => {
    console.log("Viewing profile for:", student.name)
  }

  const handleAddTask = () => {
    if (taskForm.classroomId && taskForm.studentId && taskForm.taskName && taskForm.date) {
      const classroom = classrooms.find((c) => c.id === taskForm.classroomId)
      const student = classroom?.students.find((s) => s.id === taskForm.studentId)

      if (classroom && student) {
        const newTask: Task = {
          id: Date.now().toString(),
          studentId: student.id,
          studentName: student.name,
          classroomId: classroom.id,
          classroomName: classroom.name,
          taskName: taskForm.taskName,
          date: taskForm.date,
          completed: taskForm.completed,
          score: taskForm.score,
        }

        setTasks([...tasks, newTask])
        setIsAddTaskOpen(false)
        setTaskForm({
          classroomId: "",
          studentId: "",
          taskName: "",
          date: "",
          completed: false,
          score: 0,
        })
        console.log("Task registered:", newTask)
      }
    }
  }

  const getStudentsForTaskForm = () => {
    const classroom = classrooms.find((c) => c.id === taskForm.classroomId)
    return classroom?.students || []
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">EducaGamify</h1>
              <p className="text-sm text-muted-foreground">Dashboard do Professor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Cadastrar Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Cadastrar Tarefa</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Registre a tarefa realizada pelo aluno
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="classroom" className="text-foreground">
                      Turma
                    </Label>
                    <Select
                      value={taskForm.classroomId}
                      onValueChange={(value) => setTaskForm({ ...taskForm, classroomId: value, studentId: "" })}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {classrooms.map((classroom) => (
                          <SelectItem key={classroom.id} value={classroom.id}>
                            {classroom.name} - {classroom.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student" className="text-foreground">
                      Aluno
                    </Label>
                    <Select
                      value={taskForm.studentId}
                      onValueChange={(value) => setTaskForm({ ...taskForm, studentId: value })}
                      disabled={!taskForm.classroomId}
                    >
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Selecione o aluno" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {getStudentsForTaskForm().map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taskName" className="text-foreground">
                      Nome da Tarefa
                    </Label>
                    <Input
                      id="taskName"
                      placeholder="Ex: Exercícios de Matemática"
                      value={taskForm.taskName}
                      onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-foreground">
                      Data
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={taskForm.date}
                      onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                      className="bg-input border-border text-foreground"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="completed"
                      checked={taskForm.completed}
                      onCheckedChange={(checked) => setTaskForm({ ...taskForm, completed: checked as boolean })}
                    />
                    <Label htmlFor="completed" className="text-foreground cursor-pointer">
                      Tarefa foi realizada
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="score" className="text-foreground">
                      Porcentagem de Acertos (%)
                    </Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={taskForm.score}
                      onChange={(e) => setTaskForm({ ...taskForm, score: Number(e.target.value) })}
                      className="bg-input border-border text-foreground"
                      disabled={!taskForm.completed}
                    />
                  </div>

                  <Button
                    onClick={handleAddTask}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Salvar Tarefa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Turmas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{classrooms.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {classrooms.reduce((acc, c) => acc + c.studentCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Média de Progresso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">85%</div>
            </CardContent>
          </Card>
        </div>

        {/* Classrooms Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Minhas Turmas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <Card key={classroom.id} className="border-border bg-card hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground">{classroom.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">{classroom.grade}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-muted text-foreground">
                      {classroom.studentCount} alunos
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full border-border hover:bg-muted bg-transparent"
                          onClick={() => setSelectedClassroom(classroom)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Ver Alunos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Alunos - {classroom.name}</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Lista de alunos matriculados nesta turma
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {classroom.students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-primary">
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
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span>Nível {student.level}</span>
                                    <span>•</span>
                                    <span>{student.xp} XP</span>
                                    <span>•</span>
                                    <span>{student.medals} medalhas</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewProfile(student)}
                                className="hover:bg-primary/10"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Perfil
                              </Button>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={isAddStudentOpen && selectedClassroom?.id === classroom.id}
                      onOpenChange={setIsAddStudentOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => setSelectedClassroom(classroom)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Aluno
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Adicionar Novo Aluno</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Adicione um novo aluno à turma {classroom.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground">
                              Nome Completo
                            </Label>
                            <Input
                              id="name"
                              placeholder="Digite o nome do aluno"
                              value={newStudentName}
                              onChange={(e) => setNewStudentName(e.target.value)}
                              className="bg-input border-border text-foreground"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">
                              Email
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="email@exemplo.com"
                              value={newStudentEmail}
                              onChange={(e) => setNewStudentEmail(e.target.value)}
                              className="bg-input border-border text-foreground"
                            />
                          </div>
                          <Button
                            onClick={handleAddStudent}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            Adicionar Aluno
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
