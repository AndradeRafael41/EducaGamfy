"use client"

import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Trophy, Star, Award, Target, Zap, Crown, LogOut, Gift } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"
import { OverviewTab } from "@/app/components/student/overview-tab"
import { MedalsTab } from "@/app/components/student/medals-tab"
import { RewardsStore } from "@/app/components/student/rewards-store"
import { useSession, signOut } from "next-auth/react"
import { Progress } from "@/app/components/ui/progress"

type Task = {
  id: number
  title: string
  description?: string | null
  max_points: number
  due_date?: string | null
  link?: string | null
}

type Submission = {
  id: number
  task_id: number
  student_id: number
  status: string
  submitted_at?: string | null
  link?: string | null
}

export function StudentProfile() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [studentPoints, setStudentPoints] = useState(0)
  const [studentBasePoints, setStudentBasePoints] = useState(0)
  const [student, setStudent] = useState<any | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [overviewStudent, setOverviewStudent] = useState<any | null>(null)
  const [submissions, setSubmissions] = useState<Record<number, Submission | null>>({})
  const [loading, setLoading] = useState(true)
  const [submittingTaskId, setSubmittingTaskId] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const xhrRefs = useRef<Record<number, XMLHttpRequest | null>>({})
  const [selectedFiles, setSelectedFiles] = useState<Record<number, string | null>>({})

  function handleFileChange(taskId: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setSelectedFiles((prev) => ({ ...prev, [taskId]: file?.name ?? null }))
  }

  const isSubmittedStatus = (status?: string | null) => {
    if (!status) return false
    const s = String(status).toLowerCase()
    return ['submitted', 'respondida', 'submetido', 'enviado'].includes(s)
  }

  const displayStatus = (status?: string | null) => {
    if (!status) return 'pendente'
    const s = String(status).toLowerCase()
    if (['submitted', 'respondida', 'submetido', 'enviado'].includes(s)) return 'Enviado'
    if (s === 'pending' || s === 'pendente') return 'Pendente'
    return status
  }

  useEffect(() => {
    if (!userId) return

    async function load() {
      try {
        setLoading(true)

        const r1 = await fetch(`/api/students?userId=${userId}`)
        const j1 = await r1.json()
        if (!j1.success) return

        setStudent(j1.student)
        const base = j1.student?.total_points ?? 0
        setStudentBasePoints(base)
        setStudentPoints(base)

        const classId = j1.student?.class_id

        // map to OverviewTab expected shape and set
        const overview = {
          name: j1.student?.user?.name ?? 'Aluno',
          grade: j1.student?.class?.title ?? '',
          level: j1.student?.level ?? 1,
          currentXP: j1.student?.level_progress ?? 0,
          xpToNextLevel: 100,
          totalPoints: j1.student?.total_points ?? 0,
          // use student's profile image from DB when available, otherwise keep placeholder (OverviewTab will show initials)
          avatar: j1.student?.img_profille ?? '/placeholder.svg',
          classrooms: j1.student?.class ? [{ id: String(j1.student.class.id), name: j1.student.class.title, grade: '' }] : [],
        }
        setOverviewStudent(overview)

        if (!classId) {
          setTasks([])
          setLoading(false)
          return
        }
        // fetch tasks for class
        const r2 = await fetch(`/api/tasks/student?classId=${classId}`)
        const j2 = await r2.json()
        if (j2?.success) {
          setTasks(j2.tasks ?? [])
        } else {
          setTasks([])
        }

        // fetch existing submissions
        const r3 = await fetch(`/api/task-submissions?studentId=${j1.student.id}`)
        const j3 = await r3.json()
        if (j3?.success) {
          const map: Record<number, Submission> = {}
          for (const s of j3.submissions || []) {
            map[s.task_id] = s
          }
          setSubmissions(map)
          // compute sum of submission points and add to base
          const sum = (j3.submissions || []).reduce((acc: number, it: any) => acc + (Number(it.points ?? 0)), 0)
          setStudentPoints(base + sum)
        }

        setLoading(false)
      } catch (err) {
        console.error(err)
        toast.error('Erro ao carregar dados do perfil')
        setLoading(false)
      }
    }

    load()
  }, [userId])

  async function handleSubmit(taskId: number, file?: File) {
    console.debug('[student-profile] handleSubmit start', { taskId, userId, fileName: file?.name, fileSize: file?.size, fileType: file?.type })
    if (!userId) return
    // prevent resubmission if already submitted
    if (submissions[taskId]?.status === 'submitted') {
      toast('Você já enviou esta tarefa.', { type: 'error' })
      return
    }

    setSubmittingTaskId(taskId)
    try {
      // client-side validation
      if (file) {
        console.debug('[student-profile] validating file', { name: file.name, size: file.size, type: file.type })
        const maxBytes = 10 * 1024 * 1024
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (file.size > maxBytes) {
          toast.error('Arquivo muito grande (máx 10MB)')
          setSubmittingTaskId(null)
          return
        }
        if (!file.type.startsWith('image/') && !allowed.includes(file.type)) {
          toast.error('Tipo de arquivo não permitido')
          setSubmittingTaskId(null)
          return
        }
      }

      const fd = new FormData()
      fd.append('taskId', taskId.toString())
      fd.append('studentId', userId.toString())
      if (file) fd.append('file', file)

        // log FormData entries (file names will appear as File objects)
        try {
          for (const entry of fd.entries()) {
            console.debug('[student-profile] FormData entry', { entryKey: entry[0], entryValue: entry[1] })
          }
        } catch (e) {
          console.debug('[student-profile] error listing FormData entries', e)
        }

      // If there's a file, use XHR to get upload progress, otherwise use fetch
      if (file) {
        setUploadProgress((p) => ({ ...p, [taskId]: 0 }))
        console.debug('[student-profile] starting XHR upload', { taskId })
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhrRefs.current[taskId] = xhr
          xhr.open('POST', '/api/task-submissions')
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100)
              setUploadProgress((prev) => ({ ...prev, [taskId]: percent }))
            }
          }
          xhr.onload = () => {
            try {
              const ok = xhr.status >= 200 && xhr.status < 300
              const text = xhr.responseText || ''
              const j = text ? JSON.parse(text) : null
              console.debug('[student-profile] XHR load', { status: xhr.status, responseText: text, parsed: j })
              if (!ok || !j?.success) {
                console.error('Erro ao enviar submissão', j ?? text)
                toast.error('Erro ao enviar submissão: ' + ((j?.error ?? text) || 'erro desconhecido'))
                reject(new Error('Upload failed'))
                return
              }
              setSubmissions((prev) => {
                const next = { ...prev, [taskId]: j.submission }
                try {
                  const sum = Object.values(next).reduce((acc: number, it: any) => acc + (Number(it?.points ?? 0)), 0)
                  setStudentPoints(studentBasePoints + sum)
                } catch (e) {
                  console.debug('[student-profile] error recomputing studentPoints', e)
                }
                // clear selected file for this task after successful submission
                setSelectedFiles((p) => ({ ...p, [taskId]: null }))
                return next
              })
              toast.success('Submissão enviada com sucesso!')
              resolve()
            } catch (err) {
              console.error('Erro parseando resposta', err)
              toast.error('Erro ao enviar submissão: resposta inválida')
              reject(err)
            }
          }
          xhr.onerror = (ev) => {
            console.error('XHR error', ev)
            toast.error('Erro de rede ao enviar submissão')
            reject(new Error('Network error'))
          }
          console.debug('[student-profile] xhr.send')
          xhr.send(fd)
        })
      } else {
        console.debug('[student-profile] sending fetch POST (no file)', { taskId })
        const res = await fetch('/api/task-submissions', { method: 'POST', body: fd })
        const contentType = res.headers.get('content-type') || ''
        let j: any = null

        if (contentType.includes('application/json')) {
          j = await res.json()
        } else {
          const txt = await res.text()
          console.error('Resposta não-JSON ao enviar submissão:', txt)
          toast.error('Erro ao enviar submissão: resposta inesperada do servidor')
          return
        }

        if (!res.ok || !j?.success) {
          console.error('Erro ao enviar submissão', j)
          toast.error('Erro ao enviar submissão: ' + (j?.error ?? 'erro desconhecido'))
          return
        }
        setSubmissions((prev) => {
          const next = { ...prev, [taskId]: j.submission }
          try {
            const sum = Object.values(next).reduce((acc: number, it: any) => acc + (Number(it?.points ?? 0)), 0)
            setStudentPoints(studentBasePoints + sum)
          } catch (e) {
            console.debug('[student-profile] error recomputing studentPoints', e)
          }
          // clear selected file for this task after successful submission
          setSelectedFiles((p) => ({ ...p, [taskId]: null }))
          return next
        })
        toast.success('Submissão enviada com sucesso!')
      }
    } catch (err) {
      console.error('[student-profile] handleSubmit error', err)
      toast.error('Erro ao enviar submissão: ' + ((err as any)?.message ?? 'erro desconhecido'))
    } finally {
      setSubmittingTaskId(null)
      setUploadProgress((p) => ({ ...p, [taskId]: 0 }))
      // clear xhr ref
      xhrRefs.current[taskId] = null
    }
  }

  function cancelUpload(taskId: number) {
    const xhr = xhrRefs.current[taskId]
    console.debug('[student-profile] cancelUpload called', { taskId, hasXhr: !!xhr })
    if (xhr) {
      xhr.abort()
      console.debug('[student-profile] xhr aborted', { taskId })
      xhrRefs.current[taskId] = null
      setSubmittingTaskId(null)
      setUploadProgress((p) => ({ ...p, [taskId]: 0 }))
      toast('Upload cancelado')
    }
  }

  function handleLogout() {
    try {
      signOut({ callbackUrl: '/login' })
    } catch (err) {
      console.error('Erro ao deslogar', err)
      toast.error('Erro ao realizar logout')
    }
  }

  function handleRewardRedeemed(cost: number) {
    setStudentPoints((prev) => Math.max(0, prev - cost))
    toast.success('Recompensa resgatada!')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <Card className="border-2 p-0">
          <TabsList className="w-full justify-start rounded-t-lg rounded-b-none border-b-2 bg-transparent p-0 h-auto gap-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
            >
              <span className="flex items-center gap-2">📊 Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger
              value="medals"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
            >
              <span className="flex items-center gap-2">🏆 Medalhas</span>
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
            >
              <span className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Recompensas
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab student={overviewStudent ?? { name: 'Aluno', grade: '', level: 1, currentXP: 0, xpToNextLevel: 100, totalPoints: 0, avatar: '/placeholder.svg', classrooms: [] }} />

              <div className="mt-6">
                <h3 className="text-lg font-semibold">Tarefas da sua turma</h3>

                {loading && <p>Carregando tarefas...</p>}

                {!loading && tasks.length === 0 && <p>Nenhuma tarefa encontrada para sua turma.</p>}

                <ul className="mt-4 space-y-4">
                  {tasks.map((t) => {
                    const s = submissions[t.id]
                    const submitted = isSubmittedStatus(s?.status)
                    return (
                      <li key={t.id} className="border rounded p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{t.title}</h4>
                            <p className="text-sm text-muted-foreground">{t.description}</p>
                            <p className="text-sm">
                              {isSubmittedStatus(s?.status) && s?.points != null
                                ? `Pontos obtidos: ${s.points} / ${t.max_points}`
                                : `Pontos: ${t.max_points}`}
                            </p>
                            {t.due_date && <p className="text-sm">Prazo: {new Date(t.due_date).toLocaleString()}</p>}
                            {t.link && (
                              <p className="text-sm">
                                <a href={t.link} target="_blank" rel="noreferrer" className="underline">Material</a>
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-sm">Status: {displayStatus(s?.status)}</p>
                            {s?.submitted_at && <p className="text-sm">Enviado em: {new Date(s.submitted_at).toLocaleString()}</p>}
                            {s?.link && isSubmittedStatus(s?.status) && (
                              <p className="text-sm">
                                <a href={s.link} target="_blank" rel="noreferrer" className="underline text-primary">Ver submissão</a>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="file"
                            id={`file-${t.id}`}
                            className="hidden"
                            disabled={submitted || submittingTaskId === t.id}
                            onChange={(e) => handleFileChange(t.id, e)}
                          />
                          <span className="text-sm text-muted-foreground mr-2">
                            {selectedFiles[t.id] ?? 'Nenhum arquivo selecionado'}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (submitted || submittingTaskId === t.id) return
                              const input = document.getElementById(`file-${t.id}`) as HTMLInputElement | null
                              input?.click()
                            }}
                            disabled={submitted || submittingTaskId === t.id}
                          >
                            Selecionar
                          </Button>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={async () => {
                                try {
                                  const input = document.getElementById(`file-${t.id}`) as HTMLInputElement | null
                                  const file = input?.files?.[0]
                                  // if no file selected, open file picker instead of submitting
                                  if (!file && !selectedFiles[t.id]) {
                                    input?.click()
                                    return
                                  }
                                  // prefer file from input, but fall back to selectedFiles presence
                                  console.debug('[student-profile] button click', { taskId: t.id, hasFile: !!file, fileName: file?.name ?? selectedFiles[t.id] })
                                  toast('Iniciando envio...')
                                  await handleSubmit(t.id, file)
                                } catch (e) {
                                  console.error('[student-profile] button click error', e)
                                  toast.error('Erro ao tentar enviar. Veja o console.')
                                }
                              }}
                              disabled={submitted || submittingTaskId === t.id}
                              variant={submitted ? 'ghost' : undefined}
                              className={submitted ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              {submitted
                                ? 'Enviado'
                                : submittingTaskId === t.id
                                ? 'Enviando…'
                                : 'Enviar'}
                            </Button>

                            {submittingTaskId === t.id && (
                              <Button variant="outline" onClick={() => cancelUpload(t.id)}>
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                        {uploadProgress[t.id] > 0 && (
                          <div className="mt-2">
                            <Progress value={uploadProgress[t.id]} className="h-3" />
                            <p className="text-sm text-muted-foreground">Progresso: {uploadProgress[t.id]}%</p>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="medals" className="mt-0">
              <MedalsTab medals={[]} />
            </TabsContent>

            <TabsContent value="rewards" className="mt-0">
              <RewardsStore studentPoints={studentPoints} onRewardRedeemed={handleRewardRedeemed} />
            </TabsContent>
          </div>
        </Card>
      </Tabs>
    </div>
  )
}
