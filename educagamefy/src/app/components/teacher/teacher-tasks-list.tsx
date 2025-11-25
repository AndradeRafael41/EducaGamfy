"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Badge } from "@/app/components/ui/badge"
import { AlertCircle, Download, Check, X } from "lucide-react"
import { toast } from "sonner"

interface Submission {
  id: number
  student_id: number
  student: {
    user: {
      name: string
      email: string
    }
  }
  points: number
  submitted_at: string
  link: string | null
  status: string
}

interface Task {
  id: number
  title: string
  description: string | null
  max_points: number
  created_at: string
  due_date: string | null
  link: string | null
  class: {
    id: number
    title: string
  }
  submissions: Submission[]
}

export function TeacherTasksList() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingPoints, setEditingPoints] = useState<Record<number, number>>({})
  const [submittingPoints, setSubmittingPoints] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/teacher/tasks")
      const data = await res.json()

      if (data.success) {
        setTasks(data.tasks)
      } else {
        toast.error("Erro ao carregar tarefas")
      }
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err)
      toast.error("Erro ao carregar tarefas")
    } finally {
      setLoading(false)
    }
  }

  const handleEditPoints = (submissionId: number, newPoints: number) => {
    setEditingPoints({
      ...editingPoints,
      [submissionId]: newPoints,
    })
  }

  const handleSavePoints = async (submissionId: number, maxPoints: number) => {
    const points = editingPoints[submissionId]

    if (points === undefined || points < 0) {
      toast.error("Pontuação inválida")
      return
    }

    if (points > maxPoints) {
      toast.error(`Pontuação máxima é ${maxPoints}`)
      return
    }

    try {
      setSubmittingPoints({ ...submittingPoints, [submissionId]: true })

      const res = await fetch("/api/teacher/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, points }),
      })

      const data = await res.json()

      if (data.success) {
        const updatedSubmission = data.submission

        // Encontrar tarefa correspondente (a API retorna `task` relation)
        const taskId = updatedSubmission?.task?.id ?? updatedSubmission?.task_id

        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id !== taskId) return task

            return {
              ...task,
              submissions: task.submissions.map((sub) =>
                sub.id === updatedSubmission.id
                  ? {
                      ...sub,
                      points: updatedSubmission.points,
                      link: updatedSubmission.link ?? sub.link,
                      status: updatedSubmission.status ?? sub.status,
                      student: updatedSubmission.student ?? sub.student,
                    }
                  : sub,
              ),
            }
          }),
        )

        setEditingPoints((prev) => {
          const updated = { ...prev }
          delete updated[submissionId]
          return updated
        })

        toast.success("Pontuação atualizada com sucesso!")
      } else {
        toast.error(data.error || "Erro ao atualizar pontuação")
      }
    } catch (err) {
      console.error("Erro ao atualizar pontuação:", err)
      toast.error("Erro ao atualizar pontuação")
    } finally {
      setSubmittingPoints({ ...submittingPoints, [submissionId]: false })
    }
  }

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      toast.error("Arquivo não disponível")
      return
    }

    // Abrir arquivo em nova aba
    window.open(fileUrl, "_blank")
  }

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando tarefas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhuma tarefa criada ainda</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Computar lista de turmas únicas a partir das tarefas
  const uniqueClasses = Array.from(
    new Map(tasks.map((t) => [t.class?.id, t.class])).values(),
  ).filter(Boolean) as { id: number; title: string }[]

  // Filtrar tarefas com base na turma selecionada
  const tasksToShow = selectedClassId ? tasks.filter((t) => t.class?.id === selectedClassId) : tasks

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Label className="text-sm">Filtrar por Turma</Label>
          <select
            value={selectedClassId ?? ""}
            onChange={(e) => setSelectedClassId(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-1 border border-border rounded-md bg-input text-foreground"
          >
            <option value="">Todas as Turmas</option>
            {uniqueClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-muted-foreground">Mostrando {tasksToShow.length} de {tasks.length} tarefas</div>
      </div>

      {tasksToShow.map((task) => (
        <Card key={task.id} className="border-border bg-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-foreground text-lg">{task.title}</CardTitle>
                {task.description && (
                  <CardDescription className="text-muted-foreground mt-2">{task.description}</CardDescription>
                )}
              </div>
              <Badge className="ml-2 bg-primary text-primary-foreground">{task.class.title}</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Info da tarefa */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Pontos Máximos</p>
                  <p className="font-semibold text-foreground">{task.max_points}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Criada em</p>
                  <p className="font-semibold text-foreground">
                    {new Date(task.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {task.due_date && (
                  <div>
                    <p className="text-muted-foreground">Data de Entrega</p>
                    <p className="font-semibold text-foreground">
                      {new Date(task.due_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Submissões</p>
                  <p className="font-semibold text-foreground">{task.submissions.length}</p>
                </div>
              </div>

              {/* Arquivo da tarefa */}
              {task.link && (
                <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">📎 Arquivo da tarefa disponível</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadFile(task.link!, `task-${task.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar
                  </Button>
                </div>
              )}

              {/* Submissões */}
              {task.submissions.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Submissões ({task.submissions.length})</h4>
                  <div className="space-y-3">
                    {task.submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="p-4 border border-border rounded-lg bg-muted/30 space-y-3"
                      >
                        {/* Info do aluno */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{submission.student.user.name}</p>
                            <p className="text-sm text-muted-foreground">{submission.student.user.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Enviado em {new Date(submission.submitted_at).toLocaleDateString("pt-BR")}{" "}
                              {new Date(submission.submitted_at).toLocaleTimeString("pt-BR")}
                            </p>
                          </div>
                          {submission.status === "respondida" && (
                            <Badge className="ml-2 bg-green-500/20 text-green-700">✓ Respondida</Badge>
                          )}
                        </div>

                        {/* Arquivo e Pontuação */}
                        <div className="flex items-end gap-2 flex-wrap">
                          {/* Botão para baixar arquivo */}
                          {submission.link && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadFile(
                                  submission.link!,
                                  `submission-${submission.id}-${submission.student.user.name}`
                                )
                              }
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Baixar Submissão
                            </Button>
                          )}

                          {/* Input de pontuação */}
                          <div className="flex items-end gap-2">
                            <div className="w-24">
                              <Label htmlFor={`points-${submission.id}`} className="text-xs text-muted-foreground">
                                Pontos
                              </Label>
                              <Input
                                id={`points-${submission.id}`}
                                type="number"
                                min="0"
                                max={task.max_points}
                                value={editingPoints[submission.id] ?? submission.points}
                                onChange={(e) =>
                                  handleEditPoints(submission.id, parseInt(e.target.value) || 0)
                                }
                                className="bg-input border-border text-foreground h-8"
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">/ {task.max_points}</span>

                            {editingPoints[submission.id] !== undefined && editingPoints[submission.id] !== submission.points && (
                              <Button
                                size="sm"
                                onClick={() => handleSavePoints(submission.id, task.max_points)}
                                disabled={submittingPoints[submission.id]}
                                className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Nenhuma submissão ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
