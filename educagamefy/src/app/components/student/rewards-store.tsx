"use client"

import type React from "react"

import { Card } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { AlertCircle, Zap, Gift } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog"

interface Reward {
  id: number
  name: string
  description: string
  cost: number
  category: "item" | "experience" | "special"
  icon: React.ReactNode
  availability: "available" | "unavailable"
}

const mockRewards: Reward[] = [
  {
    id: 1,
    name: "Bônus de XP (50)",
    description: "Receba 50 XP bônus para sua próxima tarefa",
    cost: 100,
    category: "experience",
    icon: <Zap className="h-6 w-6" />,
    availability: "available",
  },
  {
    id: 2,
    name: "Ícone de Perfil Especial",
    description: "Desbloqueie um ícone exclusivo para seu perfil",
    cost: 250,
    category: "special",
    icon: <Gift className="h-6 w-6" />,
    availability: "available",
  },
  {
    id: 3,
    name: "Certificado Digital",
    description: "Receba um certificado de destaque no mês",
    cost: 300,
    category: "item",
    icon: <Gift className="h-6 w-6" />,
    availability: "available",
  },
  {
    id: 4,
    name: "Bônus de XP (100)",
    description: "Receba 100 XP bônus para sua próxima tarefa",
    cost: 200,
    category: "experience",
    icon: <Zap className="h-6 w-6" />,
    availability: "available",
  },
  {
    id: 5,
    name: "Tema Personalizado (Futuro)",
    description: "Personalize a aparência do seu painel (em breve)",
    cost: 500,
    category: "special",
    icon: <Gift className="h-6 w-6" />,
    availability: "unavailable",
  },
  {
    id: 6,
    name: "Bônus de Medalha",
    description: "Aumente suas chances de ganhar medalhas especiais",
    cost: 400,
    category: "item",
    icon: <Gift className="h-6 w-6" />,
    availability: "available",
  },
]

interface RewardsStoreProps {
  studentPoints: number
  onRewardRedeemed: (rewardId: number, pointsUsed: number) => void
}

export function RewardsStore({ studentPoints, onRewardRedeemed }: RewardsStoreProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [redeemedRewards, setRedeemedRewards] = useState<number[]>([])

  const handleRedeemClick = (reward: Reward) => {
    if (reward.availability !== "available") return
    setSelectedReward(reward)
    setIsDialogOpen(true)
  }

  const handleConfirmRedeem = () => {
    if (selectedReward && studentPoints >= selectedReward.cost) {
      setRedeemedRewards([...redeemedRewards, selectedReward.id])
      onRewardRedeemed(selectedReward.id, selectedReward.cost)
      setIsDialogOpen(false)
      setSelectedReward(null)
    }
  }

  const categoryColors = {
    item: "bg-secondary/10 border-secondary/30 text-secondary",
    experience: "bg-accent/10 border-accent/30 text-accent",
    special: "bg-primary/10 border-primary/30 text-primary",
  }

  const categoryLabels = {
    item: "Item",
    experience: "Experiência",
    special: "Especial",
  }

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Seus Pontos Disponíveis</h3>
            <p className="mt-2 text-4xl font-bold text-foreground">{studentPoints}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-2">Como ganhar pontos:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>📈 Subir de nível: +100 pontos</li>
              <li>🏆 Ganhar medalha: +300 pontos</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Rewards Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground">Loja de Recompensas</h2>
          <p className="text-sm text-muted-foreground">Resgate seus pontos por recompensas exclusivas</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockRewards.map((reward) => {
            const isAffordable = studentPoints >= reward.cost
            const isRedeemed = redeemedRewards.includes(reward.id)
            const isUnavailable = reward.availability !== "available"

            return (
              <Card
                key={reward.id}
                className={`border-2 p-6 transition-all ${
                  isUnavailable ? "opacity-60 bg-muted/30 border-muted/50" : "border-card hover:shadow-md"
                }`}
              >
                <div className="flex flex-col gap-4">
                  {/* Icon and Category */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        categoryColors[reward.category as keyof typeof categoryColors]
                      }`}
                    >
                      {reward.icon}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[reward.category as keyof typeof categoryLabels]}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{reward.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{reward.description}</p>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{reward.cost}</span>
                    <span className="text-sm font-medium text-muted-foreground">pontos</span>
                  </div>

                  {/* Status and Button */}
                  <div className="flex flex-col gap-2 pt-2">
                    {isRedeemed && (
                      <div className="flex items-center gap-2 rounded-lg bg-green-100/20 p-2 text-green-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Resgatado!</span>
                      </div>
                    )}

                    <Button
                      onClick={() => handleRedeemClick(reward)}
                      disabled={isUnavailable || !isAffordable || isRedeemed}
                      variant={isAffordable && !isRedeemed && !isUnavailable ? "default" : "outline"}
                      className="w-full"
                    >
                      {isUnavailable
                        ? "Indisponível"
                        : !isAffordable
                          ? `Faltam ${reward.cost - studentPoints} pontos`
                          : isRedeemed
                            ? "Resgatado"
                            : "Resgatar"}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Resgatar Recompensa?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                <div className="text-foreground font-semibold">{selectedReward?.name}</div>
                <p className="text-sm text-muted-foreground mt-1">{selectedReward?.description}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Custo:</p>
                <p className="text-lg font-bold text-primary flex items-center gap-2">
                  {selectedReward?.cost} <span className="text-sm">pontos</span>
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Seus pontos após resgate:</p>
                <p className="text-lg font-bold text-accent">{studentPoints - (selectedReward?.cost || 0)} pontos</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="border-2">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRedeem}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirmar Resgate
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
