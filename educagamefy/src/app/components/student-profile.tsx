"use client"

import { Card } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Badge } from "@/app/components/ui/badge"
import { Progress } from "@/app/components/ui/progress"
import { Button } from "@/app/components/ui/button"
import { Trophy, Star, Award, Target, Zap, Crown, LogOut } from "lucide-react"

// Mock data - replace with real data from your database
const studentData = {
  name: "Maria Silva",
  grade: "5º Ano",
  level: 12,
  currentXP: 750,
  xpToNextLevel: 1000,
  totalPoints: 8450,
  avatar: "/happy-student-avatar.jpg",
  medals: [
    { id: 1, name: "Primeira Tarefa", icon: Star, earned: true, color: "text-accent" },
    { id: 2, name: "Matemática Expert", icon: Trophy, earned: true, color: "text-primary" },
    { id: 3, name: "10 Tarefas", icon: Target, earned: true, color: "text-secondary" },
    { id: 4, name: "Nota Perfeita", icon: Award, earned: true, color: "text-accent" },
    { id: 5, name: "Sequência de 7 dias", icon: Zap, earned: true, color: "text-chart-5" },
    { id: 6, name: "Campeão do Mês", icon: Crown, earned: false, color: "text-muted-foreground" },
    { id: 7, name: "Leitor Dedicado", icon: Star, earned: false, color: "text-muted-foreground" },
    { id: 8, name: "Cientista Junior", icon: Trophy, earned: false, color: "text-muted-foreground" },
  ],
}

export function StudentProfile() {
  const progressPercentage = (studentData.currentXP / studentData.xpToNextLevel) * 100

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logout clicked")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      {/* Header with student info */}
      <Card className="overflow-hidden border-2">
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-card md:h-32 md:w-32">
                <AvatarImage src={studentData.avatar || "/placeholder.svg"} alt={studentData.name} />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground md:text-4xl">
                  {studentData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg md:h-12 md:w-12">
                <span className="text-lg font-bold md:text-xl">{studentData.level}</span>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">{studentData.name}</h1>
              <p className="mt-1 text-lg text-muted-foreground">{studentData.grade}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Badge variant="secondary" className="text-sm">
                  <Trophy className="mr-1 h-4 w-4" />
                  {studentData.totalPoints} pontos
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Nível {studentData.level}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Level Progress Bar */}
      <Card className="border-2 p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Progresso do Nível</h2>
              <p className="text-sm text-muted-foreground">Continue completando tarefas para subir de nível!</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {studentData.currentXP}/{studentData.xpToNextLevel}
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
            Faltam {studentData.xpToNextLevel - studentData.currentXP} XP para o nível {studentData.level + 1}!
          </p>
        </div>
      </Card>

      {/* Medals Section */}
      <Card className="border-2 p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Minhas Medalhas</h2>
            <p className="text-sm text-muted-foreground">Conquiste medalhas completando desafios e tarefas especiais</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {studentData.medals.map((medal) => {
              const Icon = medal.icon
              return (
                <div
                  key={medal.id}
                  className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    medal.earned
                      ? "border-primary/20 bg-card shadow-sm hover:shadow-md"
                      : "border-dashed border-muted bg-muted/30"
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
                      medal.earned ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${medal.earned ? medal.color : "text-muted-foreground/50"}`} />
                  </div>
                  <p
                    className={`text-balance text-center text-xs font-medium ${
                      medal.earned ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {medal.name}
                  </p>
                  {!medal.earned && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60">
                      <span className="text-4xl">🔒</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm font-medium text-foreground">
              Você conquistou {studentData.medals.filter((m) => m.earned).length} de {studentData.medals.length}{" "}
              medalhas!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
