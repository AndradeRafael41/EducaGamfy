"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { Plus, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/app/components/ui/progress"

interface TaskData {
  id: string
  taskName: string
  description: string
  date: string
  dueDate?: string
  maxPoints?: number
  classId?: string
}

interface CreateTaskProps {
  onTaskCreated: (task: TaskData) => void
  tasks: TaskData[]
  onTaskDeleted: (taskId: string) => void
  classrooms?: Array<{ id: string; name: string }>
}

export function CreateTask({ onTaskCreated, tasks, onTaskDeleted, classrooms = [] }: CreateTaskProps) {
  const { data: session } = useSession()
  const teacherId = session?.user?.id
  
  const [form, setForm] = useState({
    taskName: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    maxPoints: 10,
    classId: "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleAddTask = async () => {
    if (!form.taskName.trim()) {
      toast.error("Nome da tarefa é obrigatório")
      return
    }

    if (!form.classId) {
      toast.error("Selecione uma turma")
      return
    }

    if (!teacherId) {
      toast.error("Sessão expirada. Faça login novamente.")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("title", form.taskName)
      formData.append("description", form.description)
      formData.append("maxPoints", form.maxPoints.toString())
      formData.append("teacherId", teacherId.toString())
      formData.append("classId", form.classId)
      
      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      // Use XHR for progress tracking if file exists
      if (selectedFile) {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open("POST", "/api/tasks")
          
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100)
              setUploadProgress(percent)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText)
              if (response.success) {
                const newTask: TaskData = {
                  id: response.task.id.toString(),
                  taskName: form.taskName,
                  description: form.description,
                  date: form.date,
                  dueDate: form.dueDate,
                  maxPoints: form.maxPoints,
                  classId: form.classId,
                }
                onTaskCreated(newTask)
                setForm({
                  taskName: "",
                  description: "",
                  date: new Date().toISOString().split("T")[0],
                  dueDate: "",
                  maxPoints: 10,
                  classId: "",
                })
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
                toast.success("Tarefa criada com sucesso!")
                resolve()
              } else {
                toast.error(response.error || "Erro ao criar tarefa")
                reject(new Error(response.error))
              }
            } else {
              toast.error("Erro ao criar tarefa")
              reject(new Error("Upload failed"))
            }
          }

          xhr.onerror = () => {
            toast.error("Erro de rede ao criar tarefa")
            reject(new Error("Network error"))
          }

          xhr.send(formData)
        })
      } else {
        // Fetch for non-file submission
        const res = await fetch("/api/tasks", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()
        if (data.success) {
          const newTask: TaskData = {
            id: data.task.id.toString(),
            taskName: form.taskName,
            description: form.description,
            date: form.date,
            dueDate: form.dueDate,
            maxPoints: form.maxPoints,
            classId: form.classId,
          }
          onTaskCreated(newTask)
          setForm({
            taskName: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
            dueDate: "",
            maxPoints: 10,
            classId: "",
          })
          setSelectedFile(null)
          if (fileInputRef.current) fileInputRef.current.value = ""
          toast.success("Tarefa criada com sucesso!")
        } else {
          toast.error(data.error || "Erro ao criar tarefa")
        }
      }
    } catch (err: any) {
      console.error("Erro ao criar tarefa:", err)
      toast.error("Erro ao criar tarefa: " + ((err as any)?.message ?? "erro desconhecido"))
    } finally {
      setUploading(false)
      setUploadProgress(0)
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPoints" className="text-foreground">
                  Pontos Máximos
                </Label>
                <Input
                  id="maxPoints"
                  type="number"
                  min="0"
                  value={form.maxPoints}
                  onChange={(e) => setForm({ ...form, maxPoints: parseInt(e.target.value) || 0 })}
                  className="bg-input border-border text-foreground"
                  disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classId" className="text-foreground">
                  Turma
                </Label>
                <select
                  id="classId"
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione uma turma</option>
                  {classrooms?.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Arquivo da Tarefa (Opcional)</Label>
              <div className="flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </Button>
                {selectedFile && (
                  <span className="text-sm text-muted-foreground flex-1 truncate">
                    {selectedFile.name}
                  </span>
                )}
              </div>
            </div>

            {uploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Enviando arquivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <Button 
              onClick={handleAddTask}
              disabled={uploading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {uploading ? (
                <>
                  <span className="animate-spin inline-block mr-2">⏳</span>
                  Criando tarefa...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Tarefa
                </>
              )}
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
