"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { GraduationCap, User } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [userType, setUserType] = useState<"student" | "teacher">("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Adicionar Lógica de autentificação
    console.log("[v0] Login:", { email, password, userType })

    // Redirecionar baseado no tipo de usuário
    if (userType === "teacher") {
      window.location.href = "/teacher"
    } else {
      window.location.href = "/"
    }
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
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta!</CardTitle>
          <CardDescription>Entre com suas credenciais para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>

            {/* Link esqueci a senha */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Botão de login */}
            <Button type="submit" className="w-full">
              Entrar
            </Button>

            {/* Link para registro */}
            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
