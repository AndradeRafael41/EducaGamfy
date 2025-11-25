"use client"

import { Card } from "@/app/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Lock, Check } from "lucide-react"
import { useState } from "react"

interface AvatarOption {
  id: string
  name: string
  image: string
  cost: number
  unlocked: boolean
}

interface BackgroundOption {
  id: string
  name: string
  color: string
  pattern?: string
  cost: number
  unlocked: boolean
}

const avatarOptions: AvatarOption[] = [
  { id: "1", name: "Avatar Padrão", image: "/happy-student-avatar.jpg", cost: 0, unlocked: true },
  { id: "2", name: "Avatar Neon", image: "/student-girl.jpg", cost: 250, unlocked: false },
  { id: "3", name: "Avatar Astronauta", image: "/student-boy.jpg", cost: 500, unlocked: false },
  { id: "4", name: "Avatar Pirata", image: "/pirate-avatar.png", cost: 350, unlocked: false },
  { id: "5", name: "Avatar Superhéroe", image: "/superhero-avatar.jpg", cost: 400, unlocked: false },
  { id: "6", name: "Avatar Místico", image: "/mystical-avatar.jpg", cost: 600, unlocked: false },
]

const backgroundOptions: BackgroundOption[] = [
  { id: "1", name: "Padrão", color: "from-primary/10 via-secondary/10 to-accent/10", cost: 0, unlocked: true },
  { id: "2", name: "Oceano", color: "from-blue-200 via-blue-100 to-cyan-100", cost: 200, unlocked: false },
  { id: "3", name: "Floresta", color: "from-green-300 via-green-200 to-emerald-100", cost: 200, unlocked: false },
  { id: "4", name: "Sunset", color: "from-orange-300 via-pink-200 to-red-100", cost: 300, unlocked: false },
  { id: "5", name: "Noturno", color: "from-purple-900 via-blue-900 to-indigo-900", cost: 400, unlocked: false },
  { id: "6", name: "Arco-Íris", color: "from-pink-200 via-purple-200 to-blue-200", cost: 500, unlocked: false },
]

interface CustomizationTabProps {
  currentAvatar?: string
  currentBackground?: string
  onAvatarChange?: (avatarId: string) => void
  onBackgroundChange?: (backgroundId: string) => void
  redeemedRewards?: number[]
}

export function CustomizationTab({
  currentAvatar = "1",
  currentBackground = "1",
  onAvatarChange,
  onBackgroundChange,
  redeemedRewards = [],
}: CustomizationTabProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar)
  const [selectedBackground, setSelectedBackground] = useState(currentBackground)

  const avatarRewardMap: Record<number, string> = {
    101: "2", // Avatar Neon
    102: "3", // Avatar Astronauta
    103: "4", // Avatar Pirata
    104: "5", // Avatar Superhéroe
    105: "6", // Avatar Místico
  }

  const backgroundRewardMap: Record<number, string> = {
    201: "2", // Background Oceano
    202: "3", // Background Floresta
    203: "4", // Background Sunset
    204: "5", // Background Noturno
    205: "6", // Background Arco-Íris
  }

  const isAvatarUnlocked = (avatarId: string) => {
    if (avatarId === "1") return true
    const rewardId = Object.entries(avatarRewardMap).find(([, id]) => id === avatarId)?.[0]
    return rewardId ? redeemedRewards.includes(Number.parseInt(rewardId)) : false
  }

  const isBackgroundUnlocked = (backgroundId: string) => {
    if (backgroundId === "1") return true
    const rewardId = Object.entries(backgroundRewardMap).find(([, id]) => id === backgroundId)?.[0]
    return rewardId ? redeemedRewards.includes(Number.parseInt(rewardId)) : false
  }

  const avatarOptionsWithStatus = avatarOptions.map((avatar) => ({
    ...avatar,
    unlocked: isAvatarUnlocked(avatar.id),
  }))

  const backgroundOptionsWithStatus = backgroundOptions.map((bg) => ({
    ...bg,
    unlocked: isBackgroundUnlocked(bg.id),
  }))

  const handleAvatarSelect = (id: string) => {
    const avatar = avatarOptionsWithStatus.find((a) => a.id === id)
    if (avatar && avatar.unlocked) {
      setSelectedAvatar(id)
      onAvatarChange?.(id)
    }
  }

  const handleBackgroundSelect = (id: string) => {
    const bg = backgroundOptionsWithStatus.find((b) => b.id === id)
    if (bg && bg.unlocked) {
      setSelectedBackground(id)
      onBackgroundChange?.(id)
    }
  }

  const currentAvatarData = avatarOptionsWithStatus.find((a) => a.id === selectedAvatar)
  const currentBackgroundData = backgroundOptionsWithStatus.find((b) => b.id === selectedBackground)

  return (
    <div className="space-y-6">
      {/* Preview */}
      <Card className="border-2 overflow-hidden">
        <div className={`bg-gradient-to-br ${currentBackgroundData?.color} p-8 md:p-12`}>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Pré-visualização</h3>
            </div>
            <Avatar className="h-32 w-32 border-4 border-card">
              <AvatarImage src={currentAvatarData?.image || "/placeholder.svg"} alt={currentAvatarData?.name} />
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">MA</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-foreground">{currentAvatarData?.name}</p>
              <p className="text-sm text-muted-foreground">{currentBackgroundData?.name}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Avatars Selection */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">🎭 Escolha seu Avatar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {avatarOptionsWithStatus.map((avatar) => (
            <div
              key={avatar.id}
              className="relative cursor-pointer group"
              onClick={() => handleAvatarSelect(avatar.id)}
            >
              <Card
                className={`border-2 p-4 transition-all ${
                  selectedAvatar === avatar.id && avatar.unlocked
                    ? "border-primary bg-primary/5 shadow-md"
                    : avatar.unlocked
                      ? "border-card hover:border-primary/50 hover:shadow-sm cursor-pointer"
                      : "border-muted/50 opacity-60 bg-muted/30 cursor-not-allowed"
                }`}
              >
                <Avatar className="h-16 w-16 mx-auto border-2 border-card">
                  <AvatarImage src={avatar.image || "/placeholder.svg"} alt={avatar.name} />
                  <AvatarFallback className="bg-secondary text-sm">AV</AvatarFallback>
                </Avatar>
                <p className="text-xs font-medium text-center mt-2 text-foreground truncate">{avatar.name}</p>

                {/* Status indicator */}
                {selectedAvatar === avatar.id && avatar.unlocked && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {!avatar.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center text-white">
                      <Lock className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">{avatar.cost} pontos</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Backgrounds Selection */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">🎨 Escolha seu Background</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {backgroundOptionsWithStatus.map((bg) => (
            <div key={bg.id} className="relative cursor-pointer group" onClick={() => handleBackgroundSelect(bg.id)}>
              <Card
                className={`border-2 p-4 transition-all overflow-hidden ${
                  selectedBackground === bg.id && bg.unlocked
                    ? "border-primary bg-primary/5 shadow-md"
                    : bg.unlocked
                      ? "border-card hover:border-primary/50 hover:shadow-sm cursor-pointer"
                      : "border-muted/50 opacity-60 bg-muted/30 cursor-not-allowed"
                }`}
              >
                <div className={`bg-gradient-to-br ${bg.color} h-24 rounded-lg border-2 border-card/50`}></div>
                <p className="text-xs font-medium text-center mt-2 text-foreground">{bg.name}</p>

                {/* Status indicator */}
                {selectedBackground === bg.id && bg.unlocked && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                {!bg.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center text-white">
                      <Lock className="h-6 w-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">{bg.cost} pontos</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-2 bg-accent/5 p-6">
        <h3 className="font-semibold text-foreground mb-3">💡 Como Desbloquear</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Complete tarefas para ganhar pontos</li>
          <li>• Suba de nível para ganhar bônus</li>
          <li>• Ganhe medalhas para recompensas especiais</li>
          <li>• Resgate seus pontos na Loja de Recompensas</li>
        </ul>
      </Card>
    </div>
  )
}
