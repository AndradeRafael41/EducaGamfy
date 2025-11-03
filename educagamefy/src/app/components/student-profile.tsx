"use client"

import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Trophy, Star, Award, Target, Zap, Crown, LogOut, Gift } from "lucide-react"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"
import { OverviewTab } from "@/app/components/student/overview-tab"
import { MedalsTab } from "@/app/components/student/medals-tab"
import { RewardsStore } from "@/app/components/student/rewards-store"

const studentData = {
  name: "Maria Silva",
  grade: "5º Ano",
  level: 12,
  currentXP: 750,
  xpToNextLevel: 1000,
  totalPoints: 8450,
  avatar: "/happy-student-avatar.jpg",
  classrooms: [
    { id: "1", name: "Turma A", grade: "5º Ano" },
    { id: "2", name: "Turma B", grade: "5º Ano" },
  ],
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
  const [studentPoints, setStudentPoints] = useState(studentData.totalPoints)

  const handleLogout = () => {
    console.log("Logout clicked")
  }

  const handleRewardRedeemed = (rewardId: number, pointsUsed: number) => {
    console.log(`Reward ${rewardId} redeemed! Points used: ${pointsUsed}`)
    setStudentPoints((prev) => prev - pointsUsed)
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
              <OverviewTab student={studentData} />
            </TabsContent>

            <TabsContent value="medals" className="mt-0">
              <MedalsTab medals={studentData.medals} />
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
