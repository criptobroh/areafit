/**
 * Heuristic keyword-based categorization of user messages
 * Maps to the 10 categories from the original dashboard mock
 */

type Category =
  | "Menu"
  | "Tarifas"
  | "Horarios"
  | "Equipamiento"
  | "Asesor"
  | "Ludoteca"
  | "APP"
  | "Adicionales"
  | "Otras Gestiones"
  | "Contacto"

const RULES: Array<{ category: Category; keywords: RegExp }> = [
  {
    category: "Tarifas",
    keywords: /\b(precio|precios|tarifa|tarifas|cuota|cuotas|mensualidad|cuanto cuesta|cuánto cuesta|coste|costos|pago|pagos|cobra|cobro|membres[ií]a|matr[ií]cula|inscripci[oó]n|descuento|descuentos|promoci[oó]n)\b/i,
  },
  {
    category: "Horarios",
    keywords: /\b(horario|horarios|hora|horas|abierto|abre|cierra|cierre|apertura|cuando abre|cuándo abre|cuando cierra|fin de semana|sabado|s[aá]bado|domingo|lunes|martes|miercoles|mi[eé]rcoles|jueves|viernes|festivo|feriado)\b/i,
  },
  {
    category: "Contacto",
    keywords: /\b(contacto|telefono|tel[eé]fono|llamar|hablar con|agente|persona|humano|atenci[oó]n|direcci[oó]n|ubicaci[oó]n|donde est[aá]|d[oó]nde est[aá]|email|correo|whatsapp)\b/i,
  },
  {
    category: "Ludoteca",
    keywords: /\b(ludoteca|ni[nñ]os|ni[nñ]a|hijos|hija|hijo|bebe|beb[eé]|campus|vacacional|infantil|kids)\b/i,
  },
  {
    category: "APP",
    keywords: /\b(app|aplicaci[oó]n|aplicacion|movil|m[oó]vil|play store|app store|descargar|instalar|iphone|android)\b/i,
  },
  {
    category: "Equipamiento",
    keywords: /\b(equipo|equipos|maquina|m[aá]quina|maquinas|m[aá]quinas|pesa|pesas|mancuerna|mancuernas|pesa rusa|cinta|bicicleta|el[ií]ptica|remo|banco|sala|zona|piscina|sauna|vestuario|duchas)\b/i,
  },
  {
    category: "Asesor",
    keywords: /\b(asesor|entrenador|personal|coach|tabla|rutina|plan de entrenamiento|objetivo|nutricion|nutrici[oó]n|dieta|dietista)\b/i,
  },
  {
    category: "Adicionales",
    keywords: /\b(clase|clases|zumba|yoga|pilates|crossfit|spinning|boxeo|box|bodypump|body pump|dirigidas|dirigida|reserva|reservar)\b/i,
  },
  {
    category: "Menu",
    keywords: /\b(menu|men[uú]|carta|opciones|que pueden|qu[eé] pueden|que hay|qu[eé] hay|servicios|ofrecen)\b/i,
  },
]

export function categorize(text: string | null | undefined): Category {
  if (!text) return "Otras Gestiones"
  for (const rule of RULES) {
    if (rule.keywords.test(text)) {
      return rule.category
    }
  }
  return "Otras Gestiones"
}
