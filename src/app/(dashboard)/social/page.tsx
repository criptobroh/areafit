"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockSocialSuggestions } from "@/lib/mock-data"
import { Copy, Check, Camera, Globe, Sparkles } from "lucide-react"
import { useState } from "react"

const platformIcons: Record<string, any> = {
  instagram: Camera,
  facebook: Globe,
}

const topicColors: Record<string, string> = {
  "Promociones Especiales": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Aperturas Nuevas": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Clases Dirigidas": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Testimonios": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
}

export default function SocialPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCopy(id: string, content: string) {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <Topbar title="Social Media" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-areafit-teal" />
          <p className="text-sm text-muted-foreground">
            Sugerencias generadas por IA para tus redes sociales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {mockSocialSuggestions.map((suggestion) => {
            const PlatformIcon =
              platformIcons[suggestion.platform] || Instagram
            return (
              <Card
                key={suggestion.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-[10px] border-0 ${
                          topicColors[suggestion.topic] || "bg-muted"
                        }`}
                      >
                        {suggestion.topic}
                      </Badge>
                      {suggestion.status === "published" && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 text-green-600 border-green-300"
                        >
                          Publicado
                        </Badge>
                      )}
                    </div>
                    <PlatformIcon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <h3 className="font-heading text-sm font-semibold mb-2">
                    {suggestion.title}
                  </h3>

                  <div className="rounded-lg bg-muted/50 p-3 mb-3">
                    <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                      {suggestion.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() =>
                        handleCopy(suggestion.id, suggestion.content)
                      }
                    >
                      {copiedId === suggestion.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copiar texto
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </>
  )
}
