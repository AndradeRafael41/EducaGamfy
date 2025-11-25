"use client"

import { StudentProfile } from "@/app/components/student-profile"
import { useEffect, useState } from "react"

export default function Home() {
  const [selectedBackground, setSelectedBackground] = useState("1")

  const backgroundStyles: Record<string, string> = {
    "1": "linear-gradient(to bottom right, rgb(240, 249, 255), rgb(224, 231, 255), rgb(165, 243, 252))",
    "2": "linear-gradient(to bottom right, rgb(191, 219, 254), rgb(165, 243, 252), rgb(165, 230, 241))",
    "3": "linear-gradient(to bottom right, rgb(167, 243, 208), rgb(187, 247, 208), rgb(209, 250, 229))",
    "4": "linear-gradient(to bottom right, rgb(253, 185, 107), rgb(251, 146, 60), rgb(254, 215, 170))",
    "5": "linear-gradient(to bottom right, rgb(75, 0, 130), rgb(25, 25, 112), rgb(70, 130, 180))",
    "6": "linear-gradient(to bottom right, rgb(251, 207, 232), rgb(196, 181, 253), rgb(191, 219, 254))",
  }

  useEffect(() => {
    document.documentElement.style.background = backgroundStyles[selectedBackground]
    document.documentElement.style.transition = "background 0.3s ease-in-out"
  }, [selectedBackground])

  return (
    <main className="min-h-screen p-4 md:p-8">
      <StudentProfile onBackgroundChange={setSelectedBackground} />
    </main>
  )
}
