"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { GraduationCap, User } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [userType, setUserType] = useState<"student" | "teacher">("student")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação de senha
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }

    // Adicionar Logica de Registro
    console.log("[v0] Register:", { name, email, password, userType })

    // Redirecionar para login após registro
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>Preencha os dados para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Seleção de tipo de usuário */}
            <div className="space-y-2">
              <Label>Tipo de usuário</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={userType === "student" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setUserType("student")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Aluno
                </Button>
                <Button
                  type="button"
                  variant={userType === "teacher" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setUserType("teacher")}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Professor
                </Button>
              </div>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Confirmar senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* Botão de registro */}
            <Button type="submit" className="w-full">
              Criar conta
            </Button>

            {/* Link para login */}
            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Faça login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
