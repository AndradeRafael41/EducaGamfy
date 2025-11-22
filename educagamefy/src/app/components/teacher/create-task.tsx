"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"

interface TaskData {
  id: string
  taskName: string
  description: string
  date: string
  dueDate?: string
}

interface CreateTaskProps {
  onTaskCreated: (task: TaskData) => void
  tasks: TaskData[]
  onTaskDeleted: (taskId: string) => void
}

export function CreateTask({ onTaskCreated, tasks, onTaskDeleted }: CreateTaskProps) {
  const [form, setForm] = useState({
    taskName: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
  })

  const handleAddTask = () => {
    if (form.taskName.trim()) {
      const newTask: TaskData = {
        id: Date.now().toString(),
        taskName: form.taskName,
        description: form.description,
        date: form.date,
        dueDate: form.dueDate,
      }

      onTaskCreated(newTask)

      setForm({
        taskName: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        dueDate: "",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Criar Nova Tarefa</CardTitle>
          <CardDescription className="text-muted-foreground">
            Crie uma tarefa sem atribuir a nenhuma sala ou aluno ainda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskName" className="text-foreground">
                Nome da Tarefa *
              </Label>
              <Input
                id="taskName"
                placeholder="Ex: Exercícios de Matemática"
                value={form.taskName}
                onChange={(e) => setForm({ ...form, taskName: e.target.value })}
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Descrição (Opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Adicione detalhes sobre a tarefa..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-input border-border text-foreground"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-foreground">
                  Data de Criação
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-foreground">
                  Data de Entrega (Opcional)
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <Button onClick={handleAddTask} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Criar Tarefa
            </Button>
          </div>
        </CardContent>
      </Card>

      {tasks.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Tarefas Criadas</CardTitle>
            <CardDescription className="text-muted-foreground">
              {tasks.length} tarefa(s) aguardando atribuição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{task.taskName}</p>
                    {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      Criada em {new Date(task.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTaskDeleted(task.id)}
                    className="ml-4 hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
