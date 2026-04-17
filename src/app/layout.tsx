import type { Metadata } from "next"
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { SessionProvider } from "@/lib/auth/session-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import "./globals.css"

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://areafit.xyz"
const TITLE = "AreaFit Dashboard - Panel de Control"
const DESCRIPTION =
  "Centraliza las conversaciones de Fiti (IA) con clientes de WhatsApp e Instagram en todos los centros de AreaFit. Analiza valoraciones, contactos, tendencias y temas de consulta en tiempo real."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "AreaFit",
    "dashboard",
    "gimnasio",
    "fitness",
    "Fiti",
    "chatbot IA",
    "WhatsApp",
    "Instagram",
    "analisis de conversaciones",
    "valoraciones clientes",
    "CRM gimnasios",
  ],
  authors: [{ name: "AreaFit" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "AreaFit Dashboard",
    images: [
      {
        url: "/areafitGraph.png",
        width: 1200,
        height: 630,
        alt: "AreaFit Dashboard - Panel de control para gestionar conversaciones, contactos y valoraciones",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/areafitGraph.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SessionProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </SessionProvider>
          </QueryProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
