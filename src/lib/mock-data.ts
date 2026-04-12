// Mock data for development - will be replaced with real PostgreSQL queries

export const mockKPIs = {
  totalConversations: 39792,
  totalContacts: 30509,
  totalRatings: 2077,
  avgResolvedScore: 3.01,
  avgFitiScore: 3.01,
  conversationsTrend: +12.5,
  contactsTrend: +8.3,
  ratingsTrend: -2.1,
}

export const mockContactsByCenter = [
  { center: "WhatsApp", count: 22686 },
  { center: "Las Palmas", count: 1329 },
  { center: "Murcia", count: 1314 },
  { center: "Reus", count: 1090 },
  { center: "Aljarafe", count: 1066 },
  { center: "Arrecife", count: 500 },
  { center: "Ecija", count: 392 },
  { center: "Montequinto", count: 345 },
  { center: "Aleste", count: 341 },
  { center: "Albacete", count: 312 },
  { center: "Moron", count: 301 },
  { center: "Terrassa", count: 243 },
  { center: "Naron-Ferrol", count: 132 },
]

export const mockUsageByCategory = [
  { category: "Menu", count: 88364, color: "var(--chart-1)" },
  { category: "Tarifas", count: 15642, color: "var(--chart-2)" },
  { category: "Horarios", count: 4995, color: "var(--chart-3)" },
  { category: "Contacto", count: 9921, color: "var(--chart-4)" },
  { category: "Otras Gestiones", count: 6382, color: "var(--chart-5)" },
  { category: "Asesor", count: 1212, color: "var(--chart-1)" },
  { category: "Ludoteca", count: 1459, color: "var(--chart-2)" },
  { category: "APP", count: 1187, color: "var(--chart-3)" },
  { category: "Adicionales", count: 832, color: "var(--chart-4)" },
  { category: "Equipamiento", count: 465, color: "var(--chart-5)" },
]

export const mockTrends = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  return {
    date: date.toISOString().split("T")[0],
    conversations: Math.floor(800 + Math.random() * 600 + i * 15),
    contacts: Math.floor(600 + Math.random() * 400 + i * 10),
    ratings: Math.floor(40 + Math.random() * 30 + i * 2),
  }
})

export const mockConversations = Array.from({ length: 20 }, (_, i) => ({
  id: `conv-${i + 1}`,
  contactName: i % 3 === 0 ? `3465${String(i).padStart(7, "0")}` : `user_${["maria", "carlos", "lucia", "pedro", "ana"][i % 5]}_fit`,
  channel: i % 3 === 0 ? "whatsapp" : "instagram",
  center: ["Las Palmas", "Murcia", "Reus", "Aljarafe", "Albacete"][i % 5],
  category: ["Menu", "Tarifas", "Horarios", "Equipamiento", "Asesor"][i % 5],
  lastMessage: [
    "Hola, quiero saber los horarios de zumba",
    "Cuanto cuesta la membresia mensual?",
    "Tienen piscina en el centro?",
    "Quiero cancelar mi suscripcion",
    "Donde puedo aparcar cuando voy al gym?",
    "Hay clases de crossfit los sabados?",
    "Me pueden dar info sobre el campus vacacional?",
    "Necesito hablar con un asesor",
  ][i % 8],
  messageCount: Math.floor(2 + Math.random() * 15),
  startedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  status: i % 7 === 0 ? "active" : "closed",
}))

export const mockContacts = Array.from({ length: 50 }, (_, i) => ({
  id: `contact-${i + 1}`,
  user: i % 2 === 0 ? `3465${String(Math.floor(1000000 + Math.random() * 9000000)).slice(0, 7)}` : `${["maria", "carlos", "lucia", "pedro", "ana", "elena", "javier", "sofia"][i % 8]}_fit${i}`,
  channel: i % 2 === 0 ? "whatsapp" : "instagram",
  center: ["Las Palmas", "Murcia", "Reus", "Aljarafe", "Albacete", "WhatsApp", "Ecija", "Montequinto"][i % 8],
  messageCount: Math.floor(Math.random() * 20),
  rating: Math.random() > 0.6 ? Math.floor(1 + Math.random() * 5) : null,
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
}))

export const mockRatings = Array.from({ length: 20 }, (_, i) => ({
  id: `rating-${i + 1}`,
  contactName: `${["Maria", "Carlos", "Lucia", "Pedro", "Ana", "Elena", "Javier", "Sofia"][i % 8]} ${["Garcia", "Lopez", "Martinez", "Rodriguez", "Fernandez"][i % 5]}`,
  center: ["Las Palmas", "Murcia", "Reus", "Aljarafe", "Albacete"][i % 5],
  resolvedScore: Math.floor(1 + Math.random() * 5),
  fitiScore: Math.floor(1 + Math.random() * 5),
  comment: [
    "Necesito la devolucion de la mensualidad que me cobraron el dia 7 de abril por que me he mudado y no podre asistir",
    "dar opcion de hablar con un agente",
    "Poner un numero de contacto para poder hablar con alguien real o un chat con IA no un bot...",
    "Excelente servicio, muy rapido y amable",
    "El bot no entendia mi pregunta, necesite hablar con alguien",
    "Todo perfecto, resolvieron mi duda en minutos",
    "No me sirvio de nada, tuve que ir presencialmente",
    "Muy buena atencion, gracias por la ayuda",
  ][i % 8],
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}))

export const mockSocialSuggestions = [
  {
    id: "social-1",
    topic: "Promociones Especiales",
    title: "Promocion por tiempo limitado!",
    content: "Trae a un amigo a Area Fit y ambos disfrutaran de beneficios exclusivos.\n- Matricula gratuita\n- Descuento en tu proxima cuota\nConsulta en recepcion o envianos un mensaje para mas detalles. No dejes pasar esta oportunidad!",
    platform: "instagram",
    status: "pending",
  },
  {
    id: "social-2",
    topic: "Aperturas Nuevas",
    title: "Estamos creciendo!",
    content: "El nuevo centro Area Fit en Las Palmas esta casi listo para abrir sus puertas.\n- Ubicacion: Parque Los Galgos\n- Fecha estimada de apertura: Mayo 2026\nSiguenos para estar al tanto de la inauguracion y aprovecha nuestras preinscripciones con descuentos exclusivos.",
    platform: "instagram",
    status: "pending",
  },
  {
    id: "social-3",
    topic: "Clases Dirigidas",
    title: "Nuevas clases este mes!",
    content: "Este mes incorporamos nuevas clases dirigidas en todos nuestros centros:\n- Yoga restaurativo (martes y jueves)\n- HIIT funcional (lunes, miercoles y viernes)\n- Pilates avanzado (sabados)\nReserva tu plaza en la app o en recepcion.",
    platform: "facebook",
    status: "published",
  },
  {
    id: "social-4",
    topic: "Testimonios",
    title: "Historias de exito",
    content: "Conoce a Maria, socia de Area Fit Murcia desde hace 2 anos. En este tiempo ha logrado sus objetivos de salud y bienestar gracias a nuestro equipo de entrenadores personales.\nQuieres ser el proximo? Empieza tu camino con nosotros.",
    platform: "instagram",
    status: "pending",
  },
]

export const mockConversationMessages = [
  { id: "msg-1", sender: "user", content: "vale muchas gracias.", timestamp: "2026-04-10T14:30:00Z" },
  { id: "msg-2", sender: "fiti", content: "De nada! Me alegra haber podido ayudarte. Si tienes mas preguntas sobre Area Fit, sus servicios o cualquier otra cosa, no dudes en preguntar. Te esperamos en el gimnasio para que disfrutes de todas nuestras actividades y beneficios! Mantente activo y motivado!", timestamp: "2026-04-10T14:30:15Z" },
  { id: "msg-3", sender: "user", content: "pero tiene horario? y donde se hace?", timestamp: "2026-04-10T14:32:00Z" },
  { id: "msg-4", sender: "fiti", content: "El campus vacacional de Area Fit se realiza en las instalaciones del gimnasio y esta disenado para ofrecer actividades recreativas y educativas a los hijos de los socios durante las vacaciones. Aunque no se especifica un horario exacto en los documentos, generalmente se lleva a cabo durante el horario de apertura del gimnasio, que es de lunes a viernes de 6:00 a 23:00, y los fines de semana de 9:00 a 20:00.", timestamp: "2026-04-10T14:32:20Z" },
]

export const mockTopicsSummary = [
  { topic: "Precios y Membresias", count: 18, description: "Consultas sobre costos, beneficios, promociones actuales y opciones de inscripcion." },
  { topic: "Clases y Horarios", count: 14, description: "Interes en clases como crossfit, zumba y pilates, junto con los horarios disponibles y cambios recientes." },
  { topic: "Instalaciones y Equipamiento", count: 10, description: "Preguntas sobre la disponibilidad de maquinas, areas especializadas y estado general de las instalaciones." },
  { topic: "Cancelaciones y Congelaciones", count: 9, description: "Procedimientos para cancelar o pausar la membresia, junto con politicas de reembolso." },
]
