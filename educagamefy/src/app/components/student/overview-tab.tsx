"use client"

import { Card } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Badge } from "@/app/components/ui/badge"
import { Progress } from "@/app/components/ui/progress"
import { Trophy, GraduationCap } from "lucide-react"

interface OverviewTabProps {
  student: {
    name: string
    grade: string
    level: number
    currentXP: number
    xpToNextLevel: number
    totalPoints: number
    avatar: string
    classrooms: { id: string; name: string; grade: string }[]
  }
}

export function OverviewTab({ student }: OverviewTabProps) {
  const progressPercentage = (student.currentXP / student.xpToNextLevel) * 100

  return (
    <div className="space-y-6">
      {/* Header with student info */}
      <Card className="overflow-hidden border-2">
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-card md:h-32 md:w-32">
                <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground md:text-4xl">
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg md:h-12 md:w-12">
                <span className="text-lg font-bold md:text-xl">{student.level}</span>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">{student.name}</h1>
              <p className="mt-1 text-lg text-muted-foreground">{student.grade}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Badge variant="secondary" className="text-sm">
                  <Trophy className="mr-1 h-4 w-4" />
                  {student.totalPoints} pontos
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Nível {student.level}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Classrooms */}
      <Card className="border-2 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Minhas Turmas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {student.classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="flex items-center justify-between p-4 rounded-lg border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div>
                  <p className="font-semibold text-foreground">{classroom.name}</p>
                  <p className="text-sm text-muted-foreground">{classroom.grade}</p>
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  Ativa
                </Badge>
              </div>
            ))}
          </div>
          {student.classrooms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Você ainda não está matriculado em nenhuma turma
            </div>
          )}
        </div>
      </Card>

      {/* Level Progress */}
      <Card className="border-2 p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Progresso do Nível</h2>
              <p className="text-sm text-muted-foreground">Continue completando tarefas para subir de nível!</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {student.currentXP}/{student.xpToNextLevel}
              </p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-foreground">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Faltam {student.xpToNextLevel - student.currentXP} XP para o nível {student.level + 1}!
          </p>
        </div>
      </Card>
    </div>
  )
}
