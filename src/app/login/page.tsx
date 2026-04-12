"use client"

import { useState } from "react"
import { Heart, Mail, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // TODO: Connect to actual magic link API
    await new Promise((r) => setTimeout(r, 1500))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-areafit-teal/5 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1 mb-2">
            <span className="font-heading text-3xl font-bold tracking-tight">
              area
            </span>
            <Heart className="h-7 w-7 fill-[#00AEEF] text-[#00AEEF]" />
            <span className="font-heading text-3xl font-bold tracking-tight">
              fit
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Panel de control
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center py-4 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-areafit-teal/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-areafit-teal" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold">
                    Revisa tu email
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enviamos un enlace magico a{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  El enlace expira en 10 minutos
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSent(false)}
                >
                  Usar otro email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@areafit.es"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="h-10"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-areafit-teal hover:bg-areafit-teal/90 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Enviar enlace magico
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Recibiras un enlace para iniciar sesion sin contrasena
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
