"use client"

import type React from "react"

interface Medal {
  id: number
  name: string
  icon: React.ElementType
  earned: boolean
  color: string
}

interface MedalsTabProps {
  medals: Medal[]
}

export function MedalsTab({ medals }: MedalsTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Minhas Medalhas</h2>
        <p className="text-sm text-muted-foreground">Conquiste medalhas completando desafios e tarefas especiais</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {medals.map((medal) => {
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
          Você conquistou {medals.filter((m) => m.earned).length} de {medals.length} medalhas!
        </p>
      </div>
    </div>
  )
}
