import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Lock, Check, ChevronRight, ChevronLeft, Zap, BookOpen, LifeBuoy,
  Send, RotateCcw, Trophy, Circle, ArrowRight, Copy, X, Menu,
  Sparkles, FlaskConical, Settings, KeyRound, RefreshCw
} from "lucide-react";

/* ============================================================
   RUTA CLAUDE — curso interactivo, de novato a leyenda
   ------------------------------------------------------------
   PERSONALIZA ESTAS LÍNEAS ANTES DE PUBLICAR/VENDER:
   ============================================================ */
const BRAND = "Ruta Claude";
const TAGLINE = "De novato a leyenda";
const EMAIL_DEV = "osirv92@gmail.com"; // ← tu correo (llega el feedback)
const AI_MODEL = "claude-sonnet-4-6";    // modelo para el Dojo IA

const STORAGE_KEY = "ruta_claude_v2";
const APIKEY_KEY = "ruta_claude_apikey";
const PASS_RATIO = 0.8;

/* ---------- entorno ---------- */
const hasClaude =
  typeof window !== "undefined" &&
  window.storage &&
  typeof window.storage.get === "function";

/* ---------- progreso: Claude usa window.storage, GitHub usa localStorage ---------- */
const store = {
  async load() {
    try {
      if (hasClaude) {
        const r = await window.storage.get(STORAGE_KEY);
        return r ? JSON.parse(r.value) : null;
      }
      const v = localStorage.getItem(STORAGE_KEY);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  async save(obj) {
    const s = JSON.stringify(obj);
    try {
      if (hasClaude) await window.storage.set(STORAGE_KEY, s);
      else localStorage.setItem(STORAGE_KEY, s);
    } catch {}
  },
  async clear() {
    try {
      if (hasClaude) await window.storage.delete(STORAGE_KEY);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};

/* ---------- API key (solo relevante fuera de Claude) ---------- */
const keyStore = {
  get() { if (hasClaude) return ""; try { return localStorage.getItem(APIKEY_KEY) || ""; } catch { return ""; } },
  set(k) { if (hasClaude) return; try { localStorage.setItem(APIKEY_KEY, k); } catch {} },
};

/* ---------- llamada a la IA (funciona sin key en Claude; con key en GitHub) ---------- */
async function callAI({ system, messages, maxTokens = 1024 }) {
  const key = keyStore.get();
  const headers = { "Content-Type": "application/json" };
  if (key) {
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify({ model: AI_MODEL, max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    const err = new Error("HTTP " + res.status);
    err.status = res.status;
    err.detail = t.slice(0, 200);
    throw err;
  }
  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/* ============================================================
   CONTENIDO DEL CURSO — 10 niveles
   ============================================================ */
const LEVELS = [
  {
    code: "L01", rank: "Novato", title: "Entiende la máquina",
    goal: "Explicar en 5 minutos qué es y qué no es Claude. Si no lo entiendes, no lo usas bien ni lo vendes.",
    lessons: [
      { title: "Qué es Claude (y qué NO es)", blocks: [
        { t: "p", x: "Claude es un **modelo de lenguaje**: un programa entrenado para predecir qué texto viene después. Eso es todo lo que hace. No sabe como tú sabes; no consulta una base de datos; no razona como una persona. Predice, con precisión enorme, la siguiente palabra." },
        { t: "p", x: "Todo lo asombroso —escribir código, resumir, traducir— es consecuencia de esa única habilidad a escala gigante." },
        { t: "note", x: "El 90% de la gente que 'usa IA' no entiende esto, y por eso obtiene resultados mediocres. Entenderlo es tu primera ventaja como consultor." },
        { t: "sub", x: "Lo que NO puede hacer solo" },
        { t: "list", x: [
          "No accede a internet — salvo que le des la herramienta de búsqueda",
          "No ejecuta código — salvo que le des el entorno",
          "No recuerda entre chats — salvo memoria o Projects",
          "No hace nada en el mundo real — salvo que le des conectores",
        ]},
        { t: "p", x: "Cada 'salvo que' es un nivel de este curso. Y cada uno es un servicio que puedes cobrar." },
      ]},
      { title: "Por qué a veces inventa (alucinación)", blocks: [
        { t: "p", x: "Si Claude no sabe algo, **no se calla**: predice lo más probable. Y lo más probable suena perfecto, seguro, bien redactado. Por eso una alucinación es peligrosa: no parece un error." },
        { t: "note", x: "Memoriza esto: **la probabilidad no es verdad.** Es el corazón de tu trabajo como asesor." },
        { t: "p", x: "También es **no determinista**: la misma pregunta puede dar respuestas distintas. No es un bug." },
        { t: "demo", label: "Compruébalo", x: "Pregúntale algo que domines (reglas de vóleibol, specs de tu Boulevard C50) y busca dónde es vago o se equivoca. Aprende a auditarlo." },
      ]},
      { title: "Tokens y ventana de contexto", blocks: [
        { t: "p", x: "Un **token** es una unidad de texto (en español ≈ 3 caracteres). Importa porque cuesta dinero y hay un límite." },
        { t: "p", x: "La **ventana de contexto** es la memoria de trabajo de una conversación. Lo que está dentro influye; lo que se sale, deja de existir para el modelo." },
        { t: "p", x: "Por eso un chat larguísimo 'olvida' el principio. Solución: para un tema nuevo, abre un chat nuevo." },
      ]},
      { title: "Los modelos y cuál usar", blocks: [
        { t: "p", x: "Claude es una familia. A grandes rasgos:" },
        { t: "list", x: [
          "**Haiku** — rápido y barato. Volumen",
          "**Sonnet** — el balance. Caballo de batalla",
          "**Opus** — complejo, agentes largos",
          "**Fable** — máxima capacidad disponible",
        ]},
        { t: "note", x: "Regla del consultor: empieza barato, prueba, sube solo si falla. Venderle el modelo caro a un cliente para clasificar correos es perderlo cuando vea la factura." },
      ]},
      { title: "Corte de conocimiento y búsqueda", blocks: [
        { t: "p", x: "Cada modelo tiene una **fecha de corte**: no sabe nada posterior. Para eso necesita **buscar en la web**." },
        { t: "demo", label: "Aplícalo", x: "Si necesitas el precio de un contactor Schneider LC1D18, pídele que lo busque. De memoria te da un precio inventado que suena real." },
      ]},
    ],
    quiz: [
      { q: "¿Qué hace fundamentalmente un modelo como Claude?", a: ["Predice el siguiente token de texto", "Busca en una base de datos", "Razona igual que un humano", "Copia respuestas guardadas"], c: 0 },
      { q: "¿Por qué Claude a veces 'alucina'?", a: ["Miente a propósito", "Predice lo más probable aunque no lo sepa", "Le falta RAM", "El internet está caído"], c: 1 },
      { q: "¿Qué es la ventana de contexto?", a: ["El tamaño de pantalla", "La velocidad", "La memoria de trabajo de la conversación", "El número de usuarios"], c: 2 },
      { q: "Necesitas el precio de HOY de un producto. ¿Qué hace Claude?", a: ["Responde de memoria", "Adivina", "Busca en la web", "No es posible"], c: 2 },
      { q: "¿Con qué modelo conviene empezar?", a: ["El más caro", "El más barato que resuelva la tarea", "El primero de la lista", "Da igual"], c: 1 },
    ],
  },

  {
    code: "L02", rank: "Aprendiz", title: "Aprende a hablarle",
    goal: "Dejar de 'pedir cosas' y empezar a diseñar instrucciones. La habilidad de mayor retorno del curso.",
    lessons: [
      { title: "Los 6 bloques de un buen prompt", blocks: [
        { t: "p", x: "Un prompt profesional responde seis preguntas. Cuando algo sale mal, casi siempre falta uno:" },
        { t: "list", x: [
          "**Rol** — ¿quién soy yo al responder?",
          "**Tarea** — ¿qué quieres? En verbo, específico",
          "**Contexto** — ¿qué sé yo que no puedo adivinar?",
          "**Ejemplos** — ¿cómo se ve un buen resultado?",
          "**Formato** — ¿cómo lo quieres entregado?",
          "**Restricciones** — ¿qué NO debo hacer?",
        ]},
        { t: "demo", label: "Practícalo en el Dojo", x: "En el menú → Dojo IA → Coach de prompts. Escribe un prompt y la IA lo califica según estos 6 bloques." },
      ]},
      { title: "Etiquetas XML: separa las partes", blocks: [
        { t: "p", x: "Separar secciones con etiquetas le dice al modelo dónde empieza y termina cada cosa. Reduce la confusión drásticamente." },
        { t: "code", x: "<contexto>\nCliente: integrador de León, compra 2 veces al año.\nÚltima compra: hace 14 meses. Marca: Schneider.\n</contexto>\n\n<tarea>\nRedacta un correo de reactivación.\n</tarea>\n\n<restricciones>\n- Máximo 120 palabras\n- Sin \"espero que te encuentres bien\"\n- Menciona Siemens como alternativa\n</restricciones>" },
      ]},
      { title: "Ejemplos (few-shot): lo más potente", blocks: [
        { t: "p", x: "Es lo más poderoso y lo que menos usa la gente. **Dos ejemplos valen más que diez párrafos de instrucciones.** Muéstrale, no le expliques." },
        { t: "demo", label: "Aplícalo", x: "Si quieres correos con TU voz, pégale dos correos tuyos reales como ejemplo. Imita el tono mejor que cualquier descripción." },
      ]},
      { title: "Cadena de pensamiento e iteración", blocks: [
        { t: "p", x: "**'Piensa paso a paso'** mejora razonamiento y análisis. En tareas simples solo gasta tokens — no lo uses por costumbre." },
        { t: "p", x: "El primer prompt nunca es el bueno. **Iterar** es decir exactamente qué salió mal. 'No me gustó' no es información; 'el tono es muy formal y usaste 4 tecnicismos que mi cliente no conoce' sí lo es." },
      ]},
      { title: "Antipatrones (los errores comunes)", blocks: [
        { t: "p", x: "Los errores que verás en tus futuros alumnos:" },
        { t: "list", x: [
          "**Prompt vago:** 'hazme un correo bueno'",
          "**Cortesía sin contenido:** tres párrafos amables, cero contexto",
          "**Diez tareas en una**",
          "**No dar ejemplos** y quejarse del formato",
          "**Aceptar la primera respuesta** como final",
        ]},
      ]},
    ],
    quiz: [
      { q: "¿Cuál NO es uno de los 6 bloques?", a: ["Rol", "Contexto", "Velocidad de internet", "Restricciones"], c: 2 },
      { q: "¿Para qué sirven etiquetas como <contexto>...</contexto>?", a: ["Decorar", "Marcar dónde empieza y termina cada parte", "Acelerar", "Ahorrar tokens"], c: 1 },
      { q: "¿Forma más potente de que imite tu estilo?", a: ["Describirlo con adjetivos", "Darle 2 ejemplos reales tuyos", "Pedir que sea creativo", "Usar mayúsculas"], c: 1 },
      { q: "¿Cuándo NO usar 'piensa paso a paso'?", a: ["En análisis complejos", "En matemáticas", "En tareas simples", "Nunca"], c: 2 },
      { q: "¿Qué es 'iterar' bien?", a: ["Decir 'no me gustó'", "Empezar de cero", "Decir qué falló y por qué", "Cambiar de modelo"], c: 2 },
    ],
  },

  {
    code: "L03", rank: "Practicante", title: "Dale memoria",
    goal: "Dejar de repetirte. Que Claude sepa quién eres sin contárselo cada vez.",
    lessons: [
      { title: "Projects: contexto que no se borra", blocks: [
        { t: "p", x: "Un **Project** es un espacio aislado donde subes documentos e instrucciones que **persisten entre conversaciones**. Cada chat dentro ya conoce ese contexto." },
        { t: "p", x: "No carga todo de golpe: extrae lo relevante según lo que preguntas." },
        { t: "note", x: "Regla: si vas a repetir el mismo contexto más de dos veces, es un Project." },
      ]},
      { title: "Instrucciones, estilos, memoria, preferencias", blocks: [
        { t: "list", x: [
          "**Instrucciones del proyecto** = el system prompt que TÚ controlas",
          "**Estilos** = cómo escribe (separado de qué sabe)",
          "**Memoria** = lo que recuerda entre chats",
          "**Preferencias** = ajustes globales (Configuración → Perfil)",
        ]},
      ]},
      { title: "Cuál usar cuándo", blocks: [
        { t: "p", x: "**Tema recurrente** → Project. **Cómo suena tu escritura** → Estilo. **Datos que aplican siempre** → Preferencias/Memoria. **Una sola vez** → chat normal." },
        { t: "demo", label: "Constrúyelo", x: "Arma un Project 'Ingeniería de Ventas' con: catálogo de marcas, las 23 sucursales, tu tono y tus 3 mejores cotizaciones. Cada correo saldrá con tu contexto sin explicar nada." },
      ]},
    ],
    quiz: [
      { q: "¿Qué es un Project?", a: ["Un chat más rápido", "Un espacio con contexto que persiste", "Una suscripción", "Un modelo"], c: 1 },
      { q: "¿Cuándo crear un Project?", a: ["Para una pregunta única", "Cuando repites contexto más de 2 veces", "Solo para código", "Nunca"], c: 1 },
      { q: "¿Dónde controlas el rol y reglas permanentes?", a: ["Instrucciones del proyecto", "El título del chat", "La memoria del teléfono", "No se puede"], c: 0 },
      { q: "¿Qué controla un 'Estilo'?", a: ["Qué sabe", "Cómo escribe", "La velocidad", "El precio"], c: 1 },
    ],
  },

  {
    code: "L04", rank: "Constructor", title: "Construye cosas",
    goal: "Convertir una plática de 10 minutos en una herramienta que otro puede usar. Como esta app.",
    lessons: [
      { title: "Qué es un artifact", blocks: [
        { t: "p", x: "Un **artifact** es contenido autónomo en su propio panel: editable, versionado, compartible. Documentos, código, apps, diagramas. Aparece cuando el contenido es sustancial e independiente." },
      ]},
      { title: "Apps con IA integrada (tu modelo de negocio)", blocks: [
        { t: "p", x: "Un artifact puede **llamar a la IA por dentro**. Sin API key, sin costo para ti — justo como el Dojo de esta app." },
        { t: "note", x: "Quien usa tu artifact se autentica con su cuenta de Claude, y el consumo cuenta contra sus límites, no los tuyos. Compartirlo es gratis, atienda a 10 o a 10,000." },
        { t: "p", x: "Léelo otra vez: **puedes construir una herramienta con IA adentro, publicarla y venderla sin pagar infraestructura.**" },
      ]},
      { title: "Publicar, compartir y sus límites", blocks: [
        { t: "p", x: "Botón **'Publish'** → link. Quien lo abre y lo modifica crea su propia copia; la tuya no se toca." },
        { t: "note", x: "Límite honesto: los artifacts son para prototipar y demostrar. Para producción sacas el código a tu entorno (GitHub Pages). Confundir prototipo con producto pierde clientes." },
        { t: "demo", label: "Constrúyelo", x: "Haz una calculadora de guardamotor por corriente nominal con el nombre de Elektron. Que un cliente la use frente a ti en una junta. Eso no se vende: se cierra solo." },
      ]},
    ],
    quiz: [
      { q: "¿Qué es un artifact?", a: ["Un archivo descargable normal", "Contenido autónomo y compartible en su panel", "Un modelo de IA", "Una suscripción"], c: 1 },
      { q: "Compartes un artifact con IA. ¿Quién paga el consumo?", a: ["Tú, por cada uso", "Cada usuario con su cuenta", "Nadie", "Anthropic"], c: 1 },
      { q: "Alguien modifica tu artifact publicado. ¿El tuyo?", a: ["Se sobreescribe", "Se borra", "Queda intacto; crean su copia", "Se bloquea"], c: 2 },
      { q: "¿Para qué son mejores los artifacts?", a: ["Producción crítica", "Prototipar, demostrar, compartir", "Bases de datos", "Reemplazar servidores"], c: 1 },
    ],
  },

  {
    code: "L05", rank: "Analista", title: "Datos y documentos",
    goal: "Convertir archivos y datos desordenados en entregables profesionales. Lo más práctico para tu día a día.",
    lessons: [
      { title: "Analizar archivos: sube y pregunta", blocks: [
        { t: "p", x: "Puedes subir Excel, CSV, PDF o imágenes y pedirle a Claude que los lea, resuma o analice. No copies el contenido a mano: adjunta el archivo y pregunta directo." },
        { t: "list", x: [
          "'Resume este PDF en 5 puntos'",
          "'De este Excel, dime los 10 clientes con más compra'",
          "'¿Qué patrón ves en estas ventas por sucursal?'",
        ]},
        { t: "demo", label: "Aplícalo", x: "Sube tu base de contactos y pide: 'agrúpalos por plaza y dime cuántos integradores hay en cada una'." },
      ]},
      { title: "Generar entregables (Word, Excel, PowerPoint)", blocks: [
        { t: "p", x: "Claude puede **crear archivos reales**: un Word con formato, un Excel con fórmulas, una presentación. No solo texto: el archivo descargable." },
        { t: "list", x: [
          "'Hazme una presentación de 8 diapositivas sobre este producto'",
          "'Genera un Excel con esta cotización y una columna de subtotales'",
          "'Convierte estas notas en un Word con encabezados y tabla de contenido'",
        ]},
        { t: "note", x: "Esto reemplaza horas de formato manual. Para un ingeniero de ventas es oro: propuestas, cotizaciones y reportes en minutos." },
      ]},
      { title: "Limpiar datos desordenados", blocks: [
        { t: "p", x: "¿Un Excel con filas rotas, nombres inconsistentes, columnas revueltas? Súbelo y pide que lo limpie y reestructure. La IA es buenísima con texto ambiguo." },
        { t: "demo", label: "Aplícalo", x: "'Normaliza esta lista: nombres en Título, teléfonos a 10 dígitos, y quita duplicados.'" },
      ]},
      { title: "El límite: verifica los números", blocks: [
        { t: "p", x: "Para **texto** la IA es excelente. Para **cálculos exactos**, verifica. Un modelo puede equivocarse en aritmética fina." },
        { t: "note", x: "Regla: pídele que use fórmulas (en Excel) en vez de calcular 'de cabeza', y revisa los totales críticos antes de mandarle algo a un cliente." },
      ]},
    ],
    quiz: [
      { q: "¿Cómo analizas un PDF con Claude?", a: ["Copias todo el texto a mano", "Adjuntas el archivo y preguntas", "No se puede", "Le tomas foto a la pantalla"], c: 1 },
      { q: "¿Qué puede generar Claude?", a: ["Solo texto en el chat", "Archivos reales: Word, Excel, PowerPoint", "Solo imágenes", "Solo código"], c: 1 },
      { q: "Tienes un Excel desordenado. ¿Qué haces?", a: ["Lo arreglas a mano siempre", "Lo subes y pides que lo limpie y reestructure", "No sirve para eso", "Lo borras"], c: 1 },
      { q: "¿Dónde debes tener más cuidado?", a: ["Con el texto", "Con los resúmenes", "Con cálculos numéricos exactos", "Con el formato"], c: 2 },
      { q: "Para totales críticos en Excel, ¿qué es mejor?", a: ["Que calcule 'de cabeza'", "Que use fórmulas y tú revises", "No usar Excel", "Confiar ciegamente"], c: 1 },
    ],
  },

  {
    code: "L06", rank: "Integrador", title: "Dale manos",
    goal: "Que la IA deje de hablar y empiece a hacer. Aquí está el contenido que vendía el curso que viste.",
    lessons: [
      { title: "Conectores y MCP", blocks: [
        { t: "p", x: "**MCP** (Model Context Protocol) es el estándar que permite que un modelo use herramientas externas: Gmail, Drive, Calendar y muchas más." },
        { t: "note", x: "La analogía para clientes: MCP es el USB-C de la IA. Antes cada integración era un cable propietario distinto. Ahora hay un conector estándar." },
      ]},
      { title: "Lectura vs escritura, y los riesgos", blocks: [
        { t: "p", x: "La distinción más importante: **leer** tu correo es cómodo. **Escribir** en tu correo es poderoso y peligroso." },
        { t: "list", x: [
          "**Inyección de prompt:** un correo malicioso trae instrucciones y la IA las lee como tuyas",
          "**Permisos excesivos:** diste acceso total cuando bastaba lectura",
          "**Datos sensibles:** lo que sube, subió",
          "**Confianza ciega:** nadie revisó los 300 borradores antes de enviar",
        ]},
        { t: "note", x: "Regla de oro: nunca des escritura a un flujo no probado en lectura. Nunca envíes automático lo que no revisaste manual las primeras 20 veces." },
      ]},
      { title: "Diseño de agentes: los 4 bloques", blocks: [
        { t: "p", x: "Toda automatización se diseña con cuatro bloques:" },
        { t: "code", x: "1. DISPARADOR -> 2. PROCESO -> 3. AGENTE -> 4. ACCIÓN\n   ¿Qué inicia?     ¿Qué datos     ¿Dónde       ¿Qué pasa en\n                     se mueven?     decide?      el mundo real?" },
        { t: "demo", label: "Diséñalo", x: "Seguimiento de leads: DISPARADOR = cotización sin respuesta a 5 días -> AGENTE = redacta seguimiento según cliente y monto -> ACCIÓN = borrador en tu Gmail para que TÚ revises." },
      ]},
      { title: "Flujo vs agente, y cuándo NO usar IA", blocks: [
        { t: "p", x: "Un **flujo** tiene pasos fijos, es barato y predecible. Un **agente** deja que el modelo decida, es caro y menos predecible." },
        { t: "note", x: "La mayoría de los 'agentes de IA' que se venden son en realidad flujos. Y está bien: el 80% de los problemas se resuelven con un flujo." },
        { t: "p", x: "**Cuándo NO usar IA:** si la regla es fija ('si factura > 50000 entonces autorización'), usa una regla. La IA sirve donde hay **texto, ambigüedad o juicio**." },
      ]},
    ],
    quiz: [
      { q: "¿Qué es MCP para un cliente?", a: ["Un modelo nuevo", "El USB-C de la IA: conector estándar a herramientas", "Un lenguaje", "Una suscripción"], c: 1 },
      { q: "¿Regla de oro con permisos de escritura?", a: ["Dar acceso total siempre", "No dar escritura a un flujo no probado en lectura", "Nunca usar conectores", "Enviar todo automático"], c: 1 },
      { q: "Orden correcto de los 4 bloques:", a: ["Acción-Agente-Proceso-Disparador", "Disparador-Proceso-Agente-Acción", "Proceso-Disparador-Acción-Agente", "Agente-Acción-Disparador-Proceso"], c: 1 },
      { q: "El proceso es una regla fija. ¿Qué usas?", a: ["Un agente caro", "Una regla normal, sin LLM", "Siempre IA", "No se automatiza"], c: 1 },
      { q: "¿Dónde aporta valor un LLM?", a: ["Texto, ambigüedad o juicio", "Cálculos exactos", "Reglas fijas", "Bases de datos"], c: 0 },
    ],
  },

  {
    code: "L07", rank: "Automatizador", title: "Flujos sin código",
    goal: "Montar automatizaciones reales que corren solas, sin saber programar. Aquí se vuelve tangible.",
    lessons: [
      { title: "Las herramientas y cuál elegir", blocks: [
        { t: "p", x: "No necesitas programar. Estas plataformas conectan apps con bloques visuales:" },
        { t: "list", x: [
          "**Make / n8n / Zapier** — arrastrar y soltar. Empieza aquí",
          "**Google Apps Script** — gratis, y ya tienes Gmail/Drive/Calendar",
          "**API directa** — cuando el volumen lo justifica",
        ]},
        { t: "note", x: "Para tu primer flujo: Make es el más visual y tiene plan gratis. Apps Script si ya vives en Google." },
      ]},
      { title: "Anatomía de un flujo real", blocks: [
        { t: "p", x: "Un flujo son módulos en fila. La salida de uno entra al siguiente. Ejemplo de reactivación:" },
        { t: "code", x: "[Nuevo renglón en Sheets]  <- disparador\n        |\n[Filtrar: sin compra > 12 meses]  <- proceso\n        |\n[Claude: redacta correo personalizado]  <- agente\n        |\n[Gmail: crear borrador]  <- acción" },
        { t: "p", x: "El paso clave es el **mapeo de datos**: decirle a cada módulo qué campo del anterior usar (nombre del cliente, plaza, última compra)." },
      ]},
      { title: "Conectar Claude a un flujo", blocks: [
        { t: "p", x: "En un módulo tipo 'HTTP' o 'API' llamas a Claude con tu API key. Le pasas el contexto del cliente y recibes el texto generado, que el siguiente módulo usa." },
        { t: "demo", label: "Aplícalo", x: "Recrea tu campaña de 300 borradores como flujo: Sheets -> filtro -> Claude -> borrador en Gmail. Ya lo hiciste a mano; ahora conviértelo en método replicable." },
      ]},
      { title: "Probar y monitorear", blocks: [
        { t: "p", x: "Nunca lo dejes en automático de golpe. La secuencia segura:" },
        { t: "list", x: [
          "Prueba con **1 registro** y revisa el resultado",
          "Corre en modo **borrador**, no envío directo, las primeras semanas",
          "Revisa los **logs**: qué corrió, qué falló",
          "Mide la **tasa de éxito** antes de escalar",
        ]},
        { t: "note", x: "Esta disciplina es lo que separa una automatización que ayuda de una que manda 300 correos con un error a tus clientes." },
      ]},
    ],
    quiz: [
      { q: "¿Necesitas programar para automatizar?", a: ["Sí, siempre", "No: hay plataformas visuales como Make", "Solo con Python", "Es imposible sin código"], c: 1 },
      { q: "¿Qué es el 'mapeo de datos'?", a: ["Un mapa geográfico", "Decir a cada módulo qué campo del anterior usar", "Borrar datos", "Un tipo de gráfica"], c: 1 },
      { q: "¿Cómo conectas Claude en un flujo?", a: ["No se puede", "Con un módulo HTTP/API usando tu API key", "Copiando a mano", "Solo dentro de claude.ai"], c: 1 },
      { q: "¿Cuál es la forma segura de arrancar un flujo?", a: ["Automático total desde el día 1", "Probar con 1 registro y correr en borrador primero", "Sin revisar nada", "Enviar a todos de inmediato"], c: 1 },
      { q: "¿Por qué monitorear los logs?", a: ["Para gastar más", "Para ver qué corrió y qué falló antes de escalar", "No sirve", "Es obligatorio legalmente"], c: 1 },
    ],
  },

  {
    code: "L08", rank: "Estratega", title: "Haz negocio",
    goal: "Convertir la habilidad en ingreso. Aquí está el dinero.",
    lessons: [
      { title: "Diagnóstico: qué automatizar", blocks: [
        { t: "p", x: "Un proceso es buen candidato si cumple **cuatro** condiciones. Si falta una, piénsalo. Si faltan dos, no lo hagas:" },
        { t: "list", x: [
          "**Repetitivo** — se hace igual muchas veces",
          "**Alto volumen** — pasa seguido",
          "**Tolerante a error** — un fallo no quiebra a nadie",
          "**Tiene texto** — leer, escribir, clasificar, resumir",
        ]},
        { t: "note", x: "La pregunta de oro: '¿Qué haces todos los lunes que odias?' Nadie responde 'necesito IA'. Todos responden con un proceso manual, repetitivo y odiado. Ahí está tu proyecto." },
      ]},
      { title: "ROI: nunca vendas 'IA', vende horas", blocks: [
        { t: "code", x: "Ahorro = (horas ahorradas x costo/hora)\n         + errores evitados\n         + oportunidades capturadas" },
        { t: "list", x: [
          "NO 'Implementamos IA generativa' -> SÍ 'Te devuelvo 18 horas al mes'",
          "NO 'Automatización inteligente' -> SÍ 'De 3 días a 40 minutos'",
          "NO 'Agentes autónomos' -> SÍ 'Ningún lead se queda sin seguimiento'",
        ]},
      ]},
      { title: "Precios y el error #1", blocks: [
        { t: "list", x: [
          "**Diagnóstico** (fijo) — siempre. Tu puerta de entrada",
          "**Implementación** (por proyecto) — alcance y precio cerrados",
          "**Acompañamiento** (mensual) — tu ingreso recurrente",
          "**Por hora** — solo si no queda de otra: te castiga por ser eficiente",
        ]},
        { t: "note", x: "El error #1 del novato: prometer autonomía total. 'La IA lo hará solo' es la promesa que te quema. Vende asistencia, no reemplazo. Un humano revisa. Siempre." },
      ]},
      { title: "Tu ventaja injusta", blocks: [
        { t: "p", x: "No eres 'un consultor de IA' más. Eres **un ingeniero mecatrónico con años en ventas técnicas industriales, que entiende tableros, marcas, integradores y el dolor de un comprador de planta — y además sabe de IA.**" },
        { t: "note", x: "Esa combinación es rara. Tu mercado no es 'empresas', es el Bajío industrial: integradores, OEMs, distribuidores, plantas. Gente cuyo lenguaje ya hablas." },
      ]},
    ],
    quiz: [
      { q: "¿Cuántas condiciones hacen bueno un proceso?", a: ["Dos: barato y rápido", "Cuatro: repetitivo, volumen, tolerante a error, con texto", "Una: que sea difícil", "Ninguna"], c: 1 },
      { q: "¿'La pregunta de oro'?", a: ["'¿Cuánto quieres gastar?'", "'¿Qué haces cada lunes que odias?'", "'¿Usas IA?'", "'¿Cuántos empleados tienes?'"], c: 1 },
      { q: "¿Qué debes vender?", a: ["IA generativa", "Agentes autónomos", "Horas ahorradas y resultados", "Tecnología avanzada"], c: 2 },
      { q: "¿Por qué evitar cobrar por hora?", a: ["Es ilegal", "Te castiga por ser eficiente", "A nadie le gusta", "Es caro"], c: 1 },
      { q: "¿El error #1 del novato?", a: ["Cobrar poco", "Prometer autonomía total sin revisión humana", "Usar ejemplos", "Diagnosticar"], c: 1 },
    ],
  },

  {
    code: "L09", rank: "Mentor", title: "Enseña y capacita",
    goal: "Enseñar es el servicio de mayor margen y el mejor marketing. El que enseña es el experto.",
    lessons: [
      { title: "La regla 20/80 y el momento ajá", blocks: [
        { t: "note", x: "Regla 20/80: 20% teoría, 80% manos en el teclado. Un taller donde la gente solo escucha es una conferencia, y las conferencias no se pagan bien." },
        { t: "p", x: "**El momento 'ajá':** que el alumno resuelva SU problema en clase, no un ejemplo genérico. Ese instante —ver su propio trabajo resuelto frente a sus ojos— es lo que compra tu siguiente contrato." },
      ]},
      { title: "Diseñar un taller de 2 horas", blocks: [
        { t: "p", x: "Estructura que funciona:" },
        { t: "list", x: [
          "**0:00-0:20** — Qué es y qué no es la IA (tu ficha del nivel 1)",
          "**0:20-0:50** — Los 6 bloques + demo en vivo",
          "**0:50-1:30** — Ejercicio: cada quien resuelve un problema real suyo",
          "**1:30-1:50** — Muestran resultados, tú corriges",
          "**1:50-2:00** — Siguiente paso (aquí ofreces la implementación)",
        ]},
        { t: "note", x: "El taller de 2 horas no es el negocio: es el anzuelo. De ahí salen las implementaciones." },
      ]},
      { title: "Formatos y precios ascendentes", blocks: [
        { t: "list", x: [
          "**Taller intro** (2 h) — gancho",
          "**Curso completo** (8-16 h) — producto",
          "**Acompañamiento** (4 semanas) — recurrente",
          "**Implementación** (proyecto) — lo caro",
        ]},
        { t: "p", x: "Empieza barato el primer taller. Es tu ensayo con público real y tu primer testimonio." },
      ]},
      { title: "Errores de tus alumnos", blocks: [
        { t: "list", x: [
          "**Prompts vagos** -> recuérdales los 6 bloques",
          "**Creer todo** -> haz un ejercicio de alucinación en vivo",
          "**No iterar** -> 'la primera respuesta es un borrador'",
          "**Buscar el prompt mágico** -> no existe, existe el proceso",
        ]},
      ]},
    ],
    quiz: [
      { q: "¿Qué dice la regla 20/80?", a: ["20% práctica, 80% teoría", "20% teoría, 80% manos en el teclado", "20% de anticipo", "Ganar 80% de margen"], c: 1 },
      { q: "¿Qué es el 'momento ajá'?", a: ["El café", "Que el alumno resuelva SU propio problema en clase", "El examen", "Las diapositivas"], c: 1 },
      { q: "¿Qué rol cumple el taller de 2 horas?", a: ["Es el producto caro", "Es el anzuelo para las implementaciones", "Solo teoría", "No vende"], c: 1 },
      { q: "Un alumno cree todo lo que dice la IA. ¿Qué haces?", a: ["Lo ignoras", "Un ejercicio de alucinación en vivo", "Le subes el precio", "Le dices que está mal"], c: 1 },
      { q: "¿Cómo debe ser el primer taller?", a: ["Carísimo", "Barato: es tu ensayo y primer testimonio", "Gratis siempre", "Solo online"], c: 1 },
    ],
  },

  {
    code: "L10", rank: "Leyenda", title: "Maestría",
    goal: "Las técnicas avanzadas y la mentalidad de largo plazo. El último nivel.",
    lessons: [
      { title: "Técnicas avanzadas", blocks: [
        { t: "list", x: [
          "**Encadenar prompts:** dividir un problema grande en pasos donde la salida de uno alimenta al siguiente",
          "**Meta-prompting:** pedirle a Claude que mejore tu propio prompt antes de ejecutarlo",
          "**Moldear la salida:** darle la estructura exacta que quieres",
          "**Auto-crítica:** pedirle que revise su respuesta y encuentre 3 fallos",
        ]},
        { t: "demo", label: "Pruébalo", x: "Pásale un prompt tuyo y pide: 'mejora este prompt y explícame qué cambiaste y por qué'. Ese documento antes/después cierra ventas." },
      ]},
      { title: "Ética, límites y criterio", blocks: [
        { t: "p", x: "Un buen asesor sabe qué NO automatizar: decisiones con impacto humano fuerte, datos sensibles sin protección, procesos donde un error sí duele." },
        { t: "note", x: "Decir 'esto no' te da autoridad. Un vendedor promete todo; un consultor pone límites." },
      ]},
      { title: "El aprendizaje continuo", blocks: [
        { t: "p", x: "Esto cambia cada mes. La habilidad no es memorizar un modelo, es **saber aprender el siguiente**." },
        { t: "p", x: "Ya no eres usuario. Eres alguien que entiende la herramienta a fondo. El siguiente paso real es afuera: tu portafolio y tu primer cliente." },
      ]},
    ],
    quiz: [
      { q: "¿Qué es 'meta-prompting'?", a: ["Prompts largos", "Pedirle a Claude que mejore tu propio prompt", "Usar varios modelos", "Prompts sobre metadatos"], c: 1 },
      { q: "¿Qué NO deberías automatizar?", a: ["Correos repetitivos", "Decisiones con impacto humano fuerte o datos sensibles", "Resúmenes", "Cotizaciones"], c: 1 },
      { q: "Poner límites a un cliente...", a: ["Te hace ver débil", "Te da autoridad de consultor", "Ahuyenta ventas", "Es opcional"], c: 1 },
      { q: "¿La verdadera habilidad de largo plazo?", a: ["Memorizar un modelo", "Saber aprender el siguiente cambio", "Usar un solo prompt", "Evitar la IA"], c: 1 },
      { q: "Al terminar este curso, ¿qué sigue?", a: ["Nada más", "Construir tu portafolio y cerrar tu primer cliente", "Repetir el curso", "Comprar otro curso"], c: 1 },
    ],
  },
];

/* ---------- Manual de ayuda ---------- */
const HELP = [
  { title: "Cómo funciona esta app", items: [
    "Avanzas por niveles, de Novato a Leyenda.",
    "Cada nivel tiene lecciones cortas y un examen al final.",
    "Para desbloquear el siguiente nivel necesitas aprobar el examen con 80% o más.",
    "Tu avance se guarda solo en este dispositivo.",
  ]},
  { title: "El Dojo IA y el Laboratorio", items: [
    "Dojo IA - Coach de prompts: escribes un prompt y la IA lo califica según los 6 bloques.",
    "Dojo IA - Tutor: pregúntale cualquier duda sobre usar Claude.",
    "Laboratorio: retos prácticos listos para copiar y usar con Claude.",
  ]},
  { title: "Chuleta: cómo hablarle a Claude", items: [
    "Dale un rol: 'Eres un ingeniero de ventas de material eléctrico'.",
    "Sé específico en verbo: 'redacta', 'compara', 'resume'.",
    "Dale contexto que no puede adivinar (cliente, marca, tono).",
    "Muéstrale 1-2 ejemplos de un buen resultado.",
    "Di el formato: tabla, lista, correo de 120 palabras.",
    "Pon restricciones: 'sin tecnicismos', 'máximo 5 puntos'.",
  ]},
  { title: "¿Se borró mi avance?", items: [
    "El progreso vive en el navegador de este dispositivo.",
    "En otro dispositivo, o si borras datos del navegador, empieza de cero.",
    "El botón 'Reiniciar' borra tu avance a propósito.",
  ]},
];

/* ---------- Laboratorio: retos prácticos ---------- */
const LAB = [
  { cat: "Ventas y clientes", items: [
    { title: "Correo de reactivación", goal: "Recuperar un cliente que no compra hace meses.",
      prompt: "Eres ingeniero de ventas de material eléctrico industrial.\n\n<contexto>\nCliente: {nombre}, integrador en {ciudad}.\nÚltima compra: hace {meses} meses. Marca preferida: {marca}.\n</contexto>\n\n<tarea>\nRedacta un correo breve de reactivación.\n</tarea>\n\n<restricciones>\n- Máximo 120 palabras\n- Tono cercano pero profesional, sin \"espero que se encuentre bien\"\n- Menciona una alternativa de marca disponible\n- Cierra con una pregunta que invite a responder\n</restricciones>" },
    { title: "Cotización con 3 marcas", goal: "Convertir una solicitud en propuesta comparativa.",
      prompt: "Eres ingeniero de ventas técnico.\n\n<solicitud>\n{pega aquí lo que pidió el cliente}\n</solicitud>\n\n<tarea>\nGenera una propuesta con opciones de 3 marcas (Schneider, Siemens, Eaton).\n</tarea>\n\n<formato>\nTabla: marca | modelo sugerido | ventaja clave | nivel de disponibilidad\n</formato>\n\n<restricciones>\n- No inventes precios; si no tienes el dato, escribe \"por confirmar\"\n- Añade 2 renglones de recomendación al final\n</restricciones>" },
    { title: "Objeción de precio", goal: "Preparar tu respuesta a 'está muy caro'.",
      prompt: "Eres coach de ventas B2B industriales.\n\n<situacion>\nMi cliente dice que la marca X está más barata que la que ofrezco.\nProducto: {producto}. Mi diferenciador: {servicio/soporte/tiempo de entrega}.\n</situacion>\n\n<tarea>\nDame 3 formas distintas de responder que no bajen el precio, enfocadas en valor.\nCada una en 2-3 renglones, lista para decir por teléfono.\n</tarea>" },
  ]},
  { cat: "Productividad diaria", items: [
    { title: "Resumen de correos largos", goal: "Entender un hilo enredado en segundos.",
      prompt: "<correo>\n{pega aquí el hilo de correo}\n</correo>\n\n<tarea>\nResume en: (1) qué se decidió, (2) qué me toca hacer a mí, (3) fecha límite si hay.\nMáximo 5 renglones.\n</tarea>" },
    { title: "Agenda del día", goal: "Ordenar el caos de la mañana.",
      prompt: "Tengo estos pendientes hoy: {lista tus pendientes}.\n\nOrganízalos por prioridad usando impacto vs esfuerzo. Dime cuáles hacer primero y cuáles puedo posponer o delegar. Sé breve y directo." },
    { title: "Traducir tecnicismos", goal: "Explicarle algo técnico a alguien que no lo es.",
      prompt: "Explica {concepto técnico} a {un comprador de planta / mi jefe / un cliente} que no es técnico.\nUsa una analogía, máximo 4 renglones, sin jerga." },
  ]},
  { cat: "Emprendimiento", items: [
    { title: "Evaluar una idea de negocio", goal: "Filtrar una idea antes de invertirle tiempo.",
      prompt: "Eres asesor de negocios pragmático y honesto.\n\n<idea>\n{describe tu idea}\n</idea>\n\n<tarea>\nEvalúala con estos criterios, uno por uno: tamaño de mercado, competencia, inversión inicial, tiempo a rentabilidad, y mi ventaja injusta.\nAl final dame un veredicto claro: seguir, ajustar o descartar, y por qué.\n</tarea>" },
    { title: "Nombre y propuesta de valor", goal: "Aterrizar cómo se llama y qué promete.",
      prompt: "Mi servicio: {descríbelo en una frase}. Mi cliente ideal: {quién}.\n\nDame: (1) 5 nombres posibles, (2) una propuesta de valor de una sola frase, (3) 3 formas de explicarlo en 10 segundos." },
    { title: "Publicación para LinkedIn", goal: "Mostrar autoridad sin sonar a vendedor.",
      prompt: "Eres redactor de contenido profesional en LinkedIn.\n\n<tema>\n{un problema real que resolviste o una lección}\n</tema>\n\n<tarea>\nEscribe un post de LinkedIn: gancho fuerte en la primera línea, historia breve, una lección clara, y una pregunta final para generar comentarios.\nSin hashtags excesivos, tono humano.\n</tarea>" },
  ]},
  { cat: "Consultoría de IA", items: [
    { title: "Diagnóstico rápido de un proceso", goal: "Saber si un proceso vale la pena automatizar.",
      prompt: "Eres consultor de automatización con IA.\n\n<proceso>\n{describe un proceso manual de una empresa}\n</proceso>\n\n<tarea>\nEvalúa si es buen candidato usando 4 criterios: repetitivo, alto volumen, tolerante a error, con texto de por medio.\nDame un puntaje de cada uno (alto/medio/bajo) y un veredicto: automatizar ya, con cuidado, o no vale la pena.\n</tarea>" },
    { title: "Calcular el ROI de una automatización", goal: "Ponerle número a tu propuesta.",
      prompt: "Ayúdame a estimar el ahorro de automatizar {proceso}.\n\nDatos: se hace {veces} por {semana/mes}, toma {minutos} cada vez, y la persona cuesta aprox {$} por hora.\n\nCalcula: horas ahorradas al mes, ahorro en dinero, y ayúdame a redactarlo como una frase de venta orientada a resultado." },
    { title: "Diseñar un flujo (4 bloques)", goal: "Bocetar una automatización de punta a punta.",
      prompt: "Diseña una automatización para: {describe la necesidad}.\n\nUsa los 4 bloques y sé específico:\n1. DISPARADOR — qué la inicia\n2. PROCESO — qué datos se mueven y de dónde\n3. AGENTE — qué decide la IA y con qué criterios\n4. ACCIÓN — qué pasa al final y quién revisa antes\n\nAgrega qué herramienta sin código usarías y un riesgo a cuidar." },
  ]},
];

/* ============================================================
   HELPERS DE RENDER
   ============================================================ */
function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : <React.Fragment key={i}>{p}</React.Fragment>
      )}
    </>
  );
}

function Block({ b }) {
  switch (b.t) {
    case "p": return <p className="lesson-p"><RichText text={b.x} /></p>;
    case "sub": return <h4 className="lesson-sub">{b.x}</h4>;
    case "list": return <ul className="lesson-list">{b.x.map((it, i) => <li key={i}><RichText text={it} /></li>)}</ul>;
    case "note": return (<div className="callout callout-note"><span className="callout-tag">Clave</span><p><RichText text={b.x} /></p></div>);
    case "demo": return (<div className="callout callout-demo"><span className="callout-tag callout-tag-demo">{b.label || "Practica"}</span><p><RichText text={b.x} /></p></div>);
    case "code": return <pre className="lesson-code">{b.x}</pre>;
    default: return null;
  }
}

function AIText({ text }) {
  return (
    <div className="ai-text">
      {text.split("\n").map((line, i) =>
        line.trim() === "" ? <br key={i} /> : <p key={i}><RichText text={line} /></p>
      )}
    </div>
  );
}

const passMark = (n) => Math.ceil(n * PASS_RATIO);

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState({
    started: false, name: "", unlocked: 1, passed: {}, read: {}, scores: {},
  });
  const [view, setView] = useState("intro");
  const [curLevel, setCurLevel] = useState(0);
  const [curLesson, setCurLesson] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await store.load();
      if (saved) {
        setState((s) => ({ ...s, ...saved }));
        if (saved.started) setView("map");
      }
      setLoaded(true);
    })();
  }, []);

  const persist = (next) => { setState(next); store.save(next); };

  const totalLevels = LEVELS.length;
  const passedCount = Object.values(state.passed).filter(Boolean).length;
  const pct = Math.round((passedCount / totalLevels) * 100);
  const currentRank = passedCount === 0 ? "Sin rango" : LEVELS[Math.min(passedCount, totalLevels) - 1].rank;

  const startCourse = (name) => { const next = { ...state, started: true, name: name.trim() }; persist(next); setView("map"); };
  const openLevel = (i) => { if (i + 1 > state.unlocked) return; setCurLevel(i); setView("level"); setMenuOpen(false); };
  const openLesson = (li) => { setCurLesson(li); setView("lesson"); };
  const markRead = (levelIdx, lessonIdx) => {
    const key = LEVELS[levelIdx].code + "-" + lessonIdx;
    if (state.read[key]) return;
    persist({ ...state, read: { ...state.read, [key]: true } });
  };
  const onQuizPass = (levelIdx, score) => {
    const code = LEVELS[levelIdx].code;
    const nextUnlocked = Math.max(state.unlocked, Math.min(levelIdx + 2, totalLevels));
    persist({ ...state, passed: { ...state.passed, [code]: true }, scores: { ...state.scores, [code]: score }, unlocked: nextUnlocked });
  };
  const resetAll = () => {
    if (!window.confirm("Esto borra todo tu avance y empiezas de cero. ¿Seguro?")) return;
    const fresh = { started: false, name: "", unlocked: 1, passed: {}, read: {}, scores: {} };
    store.clear(); setState(fresh); setView("intro"); setMenuOpen(false);
  };
  const goto = (v) => { setView(v); setMenuOpen(false); };

  if (!loaded) return (<div className="rc-root"><Styles /><div className="loading">Cargando...</div></div>);

  return (
    <div className="rc-root">
      <Styles />

      {view !== "intro" && (
        <header className="topbar">
          <button className="brand" onClick={() => goto("map")} aria-label="Ir al mapa">
            <Zap size={18} className="brand-icon" />
            <span className="brand-name">{BRAND}</span>
          </button>
          <div className="topbar-right">
            <div className="rankpill" title="Tu rango">
              <span className="rankpill-label">{currentRank}</span>
              <span className="rankpill-pct">{pct}%</span>
            </div>
            <button className="menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menú">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {menuOpen && (
            <nav className="dropdown">
              <button onClick={() => goto("map")}><BookOpen size={16} /> Mapa del curso</button>
              <button onClick={() => goto("dojo")}><Sparkles size={16} /> Dojo IA</button>
              <button onClick={() => goto("lab")}><FlaskConical size={16} /> Laboratorio</button>
              <button onClick={() => goto("help")}><LifeBuoy size={16} /> Manual de ayuda</button>
              <button onClick={() => goto("settings")}><Settings size={16} /> Ajustes</button>
              <button onClick={() => goto("feedback")}><Send size={16} /> Mejorar la app</button>
              <button className="danger" onClick={resetAll}><RotateCcw size={16} /> Reiniciar avance</button>
            </nav>
          )}
        </header>
      )}

      <main className="content">
        {view === "intro" && <Intro onStart={startCourse} savedName={state.name} nLevels={totalLevels} />}
        {view === "map" && <MapView state={state} pct={pct} onOpen={openLevel} onFinish={() => goto("done")} allDone={passedCount === totalLevels} />}
        {view === "level" && <LevelView level={LEVELS[curLevel]} levelIdx={curLevel} state={state} onLesson={openLesson} onQuiz={() => setView("quiz")} onBack={() => goto("map")} />}
        {view === "lesson" && (
          <LessonView
            level={LEVELS[curLevel]} levelIdx={curLevel} lessonIdx={curLesson} read={state.read}
            onRead={() => markRead(curLevel, curLesson)}
            onNav={(dir) => { const n = curLesson + dir; if (n < 0 || n >= LEVELS[curLevel].lessons.length) return setView("level"); setCurLesson(n); }}
            onBack={() => setView("level")}
          />
        )}
        {view === "quiz" && (
          <QuizView
            level={LEVELS[curLevel]} levelIdx={curLevel} alreadyPassed={!!state.passed[LEVELS[curLevel].code]}
            onPass={(score) => onQuizPass(curLevel, score)} onBack={() => setView("level")}
            onNext={() => { if (curLevel + 1 < totalLevels) { setCurLevel(curLevel + 1); setView("level"); } else goto("done"); }}
          />
        )}
        {view === "dojo" && <DojoView name={state.name} onBack={() => goto("map")} onSettings={() => goto("settings")} />}
        {view === "lab" && <LabView onBack={() => goto("map")} />}
        {view === "help" && <HelpView onBack={() => goto("map")} />}
        {view === "settings" && <SettingsView onBack={() => goto("map")} />}
        {view === "feedback" && <FeedbackView onBack={() => goto("map")} />}
        {view === "done" && <DoneView name={state.name} onBack={() => goto("map")} onFeedback={() => goto("feedback")} />}
      </main>

      {view !== "intro" && (<footer className="footer"><span>{BRAND} · {TAGLINE}</span></footer>)}
    </div>
  );
}

/* ---------- INTRO ---------- */
function Intro({ onStart, savedName, nLevels }) {
  const [name, setName] = useState(savedName || "");
  return (
    <div className="intro">
      <div className="intro-badge">Curso interactivo</div>
      <h1 className="intro-title">{BRAND}</h1>
      <p className="intro-tagline">{TAGLINE}</p>
      <p className="intro-lead">
        Aprende a usar Claude de verdad: desde cómo piensa hasta diseñar automatizaciones
        y vender tus servicios como asesor. {nLevels} niveles, un Dojo con IA para practicar,
        y un laboratorio de retos reales. Cada nivel se desbloquea cuando demuestras que aprendiste.
      </p>
      <div className="intro-steps">
        <div className="intro-step"><span className="intro-step-n">01</span><div><h3>Aprende</h3><p>Lecciones cortas con ejemplos de trabajo, vida y negocio.</p></div></div>
        <div className="intro-step"><span className="intro-step-n">02</span><div><h3>Practica con IA</h3><p>El Dojo califica tus prompts y te corrige en vivo.</p></div></div>
        <div className="intro-step"><span className="intro-step-n">03</span><div><h3>Sube de rango</h3><p>Aprueba el examen de cada nivel. De Novato a Leyenda.</p></div></div>
      </div>
      <div className="intro-form">
        <label htmlFor="nm">¿Cómo te llamas? (para tu constancia final)</label>
        <input id="nm" type="text" value={name} placeholder="Tu nombre"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name.trim() && onStart(name)} />
        <button className="btn-primary btn-lg" disabled={!name.trim()} onClick={() => onStart(name)}>
          Empezar el curso <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ---------- MAPA ---------- */
function MapView({ state, pct, onOpen, onFinish, allDone }) {
  return (
    <div className="map">
      <div className="map-head">
        <h2>Mapa del curso</h2>
        <p>Toca un nivel desbloqueado. Aprueba su examen para energizar el siguiente.</p>
        <div className="progress"><div className="progress-bar" style={{ width: pct + "%" }} /></div>
      </div>
      <div className="circuit">
        {LEVELS.map((lv, i) => {
          const unlocked = i + 1 <= state.unlocked;
          const passed = !!state.passed[lv.code];
          const isCurrent = unlocked && !passed;
          const stCls = passed ? "node-done" : unlocked ? "node-open" : "node-locked";
          const prevPassed = i > 0 && !!state.passed[LEVELS[i - 1].code];
          return (
            <div className="node-row" key={lv.code}>
              {i > 0 && <span className={"trace " + (prevPassed ? "trace-on" : "")} />}
              <button className={"node " + stCls + (isCurrent ? " node-pulse" : "")} onClick={() => onOpen(i)} disabled={!unlocked} aria-label={"Nivel " + (i + 1) + ": " + lv.rank}>
                <span className="node-dot">
                  {passed ? <Check size={22} /> : unlocked ? <span className="node-num">{i + 1}</span> : <Lock size={18} />}
                </span>
                <span className="node-body">
                  <span className="node-rank">{lv.rank}</span>
                  <span className="node-title">{lv.title}</span>
                  <span className="node-meta">{lv.code} · {lv.lessons.length} lecciones{passed && <span className="node-score"> · {state.scores[lv.code]}%</span>}</span>
                </span>
                {unlocked && <ChevronRight size={20} className="node-arrow" />}
              </button>
            </div>
          );
        })}
      </div>
      {allDone && (<button className="btn-primary btn-lg map-cta" onClick={onFinish}><Trophy size={18} /> Ver mi constancia de Leyenda</button>)}
    </div>
  );
}

/* ---------- NIVEL ---------- */
function LevelView({ level, state, onLesson, onQuiz, onBack }) {
  const readCount = level.lessons.filter((_, i) => state.read[level.code + "-" + i]).length;
  const allRead = readCount === level.lessons.length;
  const passed = !!state.passed[level.code];
  return (
    <div className="level">
      <button className="back" onClick={onBack}><ChevronLeft size={18} /> Mapa</button>
      <div className="level-head">
        <span className="level-code">{level.code} · {level.rank}</span>
        <h2>{level.title}</h2>
        <p className="level-goal">{level.goal}</p>
      </div>
      <div className="lesson-list-nav">
        {level.lessons.map((ls, i) => {
          const done = state.read[level.code + "-" + i];
          return (
            <button key={i} className="lesson-item" onClick={() => onLesson(i)}>
              <span className={"lesson-check " + (done ? "on" : "")}>{done ? <Check size={14} /> : <Circle size={9} />}</span>
              <span className="lesson-item-title">{ls.title}</span>
              <ChevronRight size={16} className="lesson-item-arrow" />
            </button>
          );
        })}
      </div>
      <div className="level-quiz-box">
        <div className="level-quiz-info">
          <span className="quiz-label">Examen del nivel</span>
          <span className="quiz-sub">
            {passed ? "Aprobado con " + state.scores[level.code] + "%. Puedes repetirlo."
              : allRead ? "Ya leíste todo. Demuestra que aprendiste."
              : "Leíste " + readCount + " de " + level.lessons.length + " lecciones. Puedes examinarte cuando quieras."}
          </span>
        </div>
        <button className="btn-primary" onClick={onQuiz}>{passed ? "Repetir examen" : "Tomar examen"} <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

/* ---------- LECCIÓN ---------- */
function LessonView({ level, lessonIdx, read, onRead, onNav, onBack }) {
  const lesson = level.lessons[lessonIdx];
  const isRead = read[level.code + "-" + lessonIdx];
  const last = lessonIdx === level.lessons.length - 1;
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [lessonIdx]);
  return (
    <div className="lesson">
      <button className="back" onClick={onBack}><ChevronLeft size={18} /> {level.rank}</button>
      <span className="lesson-counter">Lección {lessonIdx + 1} / {level.lessons.length}</span>
      <h2 className="lesson-title">{lesson.title}</h2>
      <div className="lesson-body">{lesson.blocks.map((b, i) => <Block key={i} b={b} />)}</div>
      {!isRead ? (<button className="btn-outline mark-read" onClick={onRead}><Check size={16} /> Marcar como leída</button>)
        : (<div className="read-badge"><Check size={16} /> Leída</div>)}
      <div className="lesson-nav">
        <button className="btn-ghost" onClick={() => onNav(-1)}><ChevronLeft size={16} /> Anterior</button>
        <button className="btn-primary" onClick={() => onNav(1)}>{last ? "Terminar nivel" : "Siguiente"} <ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

/* ---------- EXAMEN ---------- */
function QuizView({ level, levelIdx, onPass, onBack, onNext }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const need = passMark(level.quiz.length);
  const correct = useMemo(() => level.quiz.reduce((a, q, i) => a + (answers[i] === q.c ? 1 : 0), 0), [answers, level.quiz]);
  const score = Math.round((correct / level.quiz.length) * 100);
  const passed = correct >= need;
  const allAnswered = Object.keys(answers).length === level.quiz.length;
  const submit = () => { setSubmitted(true); if (correct >= need) onPass(score); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const retry = () => { setAnswers({}); setSubmitted(false); window.scrollTo({ top: 0, behavior: "auto" }); };
  return (
    <div className="quiz">
      <button className="back" onClick={onBack}><ChevronLeft size={18} /> {level.rank}</button>
      <span className="lesson-code">{level.code} · Examen</span>
      <h2 className="quiz-title">Demuestra lo que aprendiste</h2>
      <p className="quiz-req">Necesitas {need} de {level.quiz.length} correctas (80%) para desbloquear el siguiente nivel.</p>
      {submitted && (
        <div className={"result " + (passed ? "result-pass" : "result-fail")}>
          {passed ? <Check size={28} /> : <X size={28} />}
          <div><strong>{passed ? "¡Aprobado!" : "Aún no"}</strong><span>{correct} de {level.quiz.length} correctas · {score}%</span></div>
        </div>
      )}
      <div className="quiz-questions">
        {level.quiz.map((q, i) => (
          <div className="q" key={i}>
            <p className="q-text"><span className="q-n">{i + 1}</span>{q.q}</p>
            <div className="q-opts">
              {q.a.map((opt, j) => {
                const chosen = answers[i] === j;
                let cls = "opt";
                if (submitted) { if (j === q.c) cls += " opt-correct"; else if (chosen) cls += " opt-wrong"; }
                else if (chosen) cls += " opt-chosen";
                return (
                  <button key={j} className={cls} disabled={submitted} onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}>
                    <span className="opt-mark">{String.fromCharCode(65 + j)}</span>{opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button className="btn-primary btn-lg" disabled={!allAnswered} onClick={submit}>
          {allAnswered ? "Calificar examen" : "Responde las " + level.quiz.length + " preguntas"}
        </button>
      ) : passed ? (
        <button className="btn-primary btn-lg" onClick={onNext}>
          {levelIdx + 1 < LEVELS.length ? "Ir al siguiente nivel" : "Terminar el curso"} <ArrowRight size={18} />
        </button>
      ) : (
        <div className="quiz-retry">
          <p>Repasa el nivel y vuelve a intentar. Nadie mira, es tu práctica.</p>
          <div className="quiz-retry-btns">
            <button className="btn-outline" onClick={onBack}>Repasar lecciones</button>
            <button className="btn-primary" onClick={retry}>Intentar de nuevo</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- DOJO IA ---------- */
const DOJO_SCENARIOS = [
  { id: "reactiva", label: "Correo de reactivación", text: "Escribe un prompt para que Claude redacte un correo que reactive a un cliente integrador que no compra hace 14 meses." },
  { id: "cotiza", label: "Cotización con marcas", text: "Escribe un prompt para convertir la solicitud de un cliente en una propuesta comparando 3 marcas." },
  { id: "idea", label: "Evaluar idea de negocio", text: "Escribe un prompt para que Claude evalúe con criterios claros una idea de negocio tuya." },
  { id: "diag", label: "Diagnóstico de proceso", text: "Escribe un prompt para diagnosticar si un proceso de una empresa vale la pena automatizar." },
  { id: "libre", label: "Tema libre", text: "Escribe cualquier prompt que quieras que la IA califique." },
];

function DojoView({ name, onBack, onSettings }) {
  const [mode, setMode] = useState("coach");
  return (
    <div className="dojo">
      <button className="back" onClick={onBack}><ChevronLeft size={18} /> Mapa</button>
      <div className="dojo-head">
        <Sparkles size={22} className="dojo-icon" />
        <div><h2>Dojo IA</h2><p>Practica con Claude de verdad, aquí dentro.</p></div>
      </div>
      <div className="dojo-tabs">
        <button className={"dojo-tab " + (mode === "coach" ? "on" : "")} onClick={() => setMode("coach")}>Coach de prompts</button>
        <button className={"dojo-tab " + (mode === "tutor" ? "on" : "")} onClick={() => setMode("tutor")}>Tutor</button>
      </div>
      {mode === "coach" ? <Coach name={name} onSettings={onSettings} /> : <Tutor name={name} onSettings={onSettings} />}
    </div>
  );
}

function ApiError({ err, onSettings }) {
  const noKey = !hasClaude && err && (err.status === 401 || err.status === 400 || (err.message && err.message.includes("Failed to fetch")) || err.name === "TypeError");
  return (
    <div className="ai-error">
      <strong>No pude conectar con la IA.</strong>
      {noKey ? (
        <>
          <p>Estás usando la app fuera de Claude. Para activar el Dojo, agrega tu API key de Anthropic en Ajustes.</p>
          <button className="btn-outline" onClick={onSettings}><KeyRound size={15} /> Ir a Ajustes</button>
        </>
      ) : (
        <p>Intenta de nuevo en un momento. {err && err.status ? "(error " + err.status + ")" : ""}</p>
      )}
    </div>
  );
}

function Coach({ name, onSettings }) {
  const [scenario, setScenario] = useState(DOJO_SCENARIOS[0]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [err, setErr] = useState(null);

  const evaluate = async () => {
    setLoading(true); setResult(""); setErr(null);
    try {
      const system = "Eres un coach experto de prompt engineering. Tu alumno es " + (name || "un estudiante") + ", ingeniero mecatrónico en ventas industriales que aprende a ser consultor de IA. Evalúa el prompt que escribió para el escenario dado. Responde SIEMPRE en español, con este formato exacto y breve:\n\nCalificación: X/100\n\nQué tiene bien: (1-2 renglones)\n\nRevisión de los 6 bloques:\n- Rol: si o no y por qué (media línea)\n- Tarea: si o no\n- Contexto: si o no\n- Ejemplos: si o no\n- Formato: si o no\n- Restricciones: si o no\n\nVersión mejorada:\n(reescribe el prompt mejorado, listo para copiar)\n\nSé directo y concreto. No añadas nada más.";
      const user = "Escenario: " + scenario.text + "\n\nPrompt del alumno:\n\"\"\"" + prompt + "\"\"\"";
      const out = await callAI({ system, messages: [{ role: "user", content: user }], maxTokens: 1024 });
      setResult(out);
    } catch (e) { setErr(e); }
    setLoading(false);
  };

  return (
    <div className="coach">
      <div className="fb-field">
        <label>Elige un escenario</label>
        <div className="fb-chips">
          {DOJO_SCENARIOS.map((s) => (
            <button key={s.id} className={"chip " + (scenario.id === s.id ? "chip-on" : "")} onClick={() => { setScenario(s); setResult(""); setErr(null); }}>{s.label}</button>
          ))}
        </div>
        <p className="coach-scenario">{scenario.text}</p>
      </div>
      <div className="fb-field">
        <label htmlFor="cp">Tu prompt</label>
        <textarea id="cp" rows={7} value={prompt} placeholder="Escribe aquí el prompt que le darías a Claude..." onChange={(e) => setPrompt(e.target.value)} />
      </div>
      <button className="btn-primary btn-lg" disabled={loading || !prompt.trim()} onClick={evaluate}>
        {loading ? (<><RefreshCw size={18} className="spin" /> Evaluando...</>) : (<><Sparkles size={18} /> Calificar mi prompt</>)}
      </button>
      {err && <ApiError err={err} onSettings={onSettings} />}
      {result && (<div className="ai-panel"><span className="ai-panel-tag">Coach IA</span><AIText text={result} /></div>)}
    </div>
  );
}

function Tutor({ name, onSettings }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const endRef = useRef(null);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next); setInput(""); setLoading(true); setErr(null);
    try {
      const system = "Eres un tutor amable y claro que enseña a " + (name || "un estudiante") + " a usar Claude y la IA para su trabajo (ventas industriales) y para volverse consultor de IA. Responde en español, breve y práctico, con ejemplos concretos. Si te preguntan algo fuera de IA/productividad/consultoría, redirígelo con calidez al tema del curso.";
      const out = await callAI({ system, messages: next.map((m) => ({ role: m.role, content: m.content })), maxTokens: 1000 });
      setMsgs((m) => [...m, { role: "assistant", content: out }]);
    } catch (e) { setErr(e); setMsgs((m) => m.slice(0, -1)); setInput(text); }
    setLoading(false);
  };

  const suggestions = ["¿Cómo escribo un buen prompt?", "¿Qué es un Project y cuándo lo uso?", "Dame una idea para automatizar mi trabajo"];

  return (
    <div className="tutor">
      {msgs.length === 0 && !loading && (
        <div className="tutor-empty">
          <p>Pregúntale lo que quieras sobre usar Claude. Por ejemplo:</p>
          <div className="tutor-suggs">
            {suggestions.map((s, i) => (<button key={i} className="chip" onClick={() => setInput(s)}>{s}</button>))}
          </div>
        </div>
      )}
      <div className="tutor-thread">
        {msgs.map((m, i) => (
          <div key={i} className={"bubble " + (m.role === "user" ? "bubble-user" : "bubble-ai")}>
            {m.role === "assistant" ? <AIText text={m.content} /> : <p>{m.content}</p>}
          </div>
        ))}
        {loading && <div className="bubble bubble-ai"><RefreshCw size={16} className="spin" /> Pensando...</div>}
        <div ref={endRef} />
      </div>
      {err && <ApiError err={err} onSettings={onSettings} />}
      <div className="tutor-input">
        <textarea rows={2} value={input} placeholder="Escribe tu pregunta..." onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="btn-primary tutor-send" disabled={loading || !input.trim()} onClick={send}><Send size={18} /></button>
      </div>
    </div>
  );
}

/* ---------- LABORATORIO ---------- */
function LabView({ onBack }) {
  const [copied, setCopied] = useState(null);
  const copy = async (id, text) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1800); } catch {}
  };
  return (
    <div className="lab">
      <button className="back" onClick={onBack}><ChevronLeft size={18} /> Mapa</button>
      <div className="dojo-head">
        <FlaskConical size={22} className="dojo-icon" />
        <div><h2>Laboratorio</h2><p>Retos listos para copiar y usar con Claude. Reemplaza lo que está entre llaves.</p></div>
      </div>
      {LAB.map((sec, si) => (
        <div className="lab-cat" key={si}>
          <h3 className="lab-cat-title">{sec.cat}</h3>
          {sec.items.map((ex, ei) => {
            const id = si + "-" + ei;
            return (
              <div className="lab-card" key={ei}>
                <div className="lab-card-head">
                  <div>
                    <h4>{ex.title}</h4>
                    <p className="lab-goal">{ex.goal}</p>
                  </div>
                  <button className="lab-copy" onClick={() => copy(id, ex.prompt)}>
                    {copied === id ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                  </button>
                </div>
                <pre className="lab-prompt">{ex.prompt}</pre>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ---------- MANUAL ---------- */
function HelpView({ onBack }) {
  return (
    <div className="help">
      <button className="back" onClick={onBack}><ChevronLeft size={18} /> Mapa</button>
      <h2>Manual de ayuda</h2>
      <p className="help-lead">Lo esencial para moverte por la app y hablarle bien a Claude.</p>
      {HELP.map((sec, i) => (
        <div className="help-card" key={i}>
          <h3>{sec.title}</h3>
          <ul>{sec.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

/* ---------- AJUSTES (API key) ---------- */
function SettingsView({ onBack }) {
  const [key, setKey] = useState(keyStore.get());
  const [saved, setSaved] = useState(false);
  const save = () => { keyStore.set(key.trim()); setSaved(true); setTimeout(() => setSaved(false), 1800); };
  return (
    <div className="settings">
      <button className="back" onClick={onBack}><ChevronLeft size={18} /> Mapa</button>
      <h2>Ajustes</h2>
      {hasClaude ? (
        <div className="help-card">
          <h3>Dojo IA</h3>
          <p className="settings-p">Estás usando la app dentro de Claude, así que el Dojo IA <strong>ya funciona sin configurar nada</strong>. No necesitas API key aquí.</p>
          <p className="settings-p">Este ajuste solo importa cuando publiques la app en tu propio sitio (GitHub Pages). Ahí, cada usuario pega su propia API key.</p>
        </div>
      ) : (
        <div className="help-card">
          <h3><KeyRound size={16} /> API key de Anthropic</h3>
          <p className="settings-p">Para activar el Dojo IA fuera de Claude, pega tu clave. Se guarda <strong>solo en este dispositivo</strong> y solo se usa para hablar con la API de Anthropic.</p>
          <input className="settings-input" type="password" value={key} placeholder="sk-ant-..." onChange={(e) => setKey(e.target.value)} />
          <div className="settings-actions">
            <button className="btn-primary" onClick={save}>{saved ? "Guardado" : "Guardar clave"}</button>
            <a className="btn-outline" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">Obtener una clave</a>
          </div>
          <p className="settings-note">Consejo: si vas a vender la app, considera un pequeño servidor intermedio con tu propia clave, para que tus usuarios no tengan que poner la suya. Lo explico en la guía de monetización.</p>
        </div>
      )}
    </div>
  );
}

/* ---------- FEEDBACK ---------- */
function FeedbackView({ onBack }) {
  const [tipo, setTipo] = useState("Idea de mejora");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const subject = BRAND + " — " + tipo;
  const body = "Tipo: " + tipo + "\n\nMensaje:\n" + msg + "\n\n---\nEnviado desde " + BRAND;
  const mailto = "mailto:" + EMAIL_DEV + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  const copyAll = async () => {
    try { await navigator.clipboard.writeText("Para: " + EMAIL_DEV + "\nAsunto: " + subject + "\n\n" + body); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  return (
    <div className="feedback">
      <button className="back" onClick={onBack}><ChevronLeft size={18} /> Mapa</button>
      <h2>Mejorar la app</h2>
      <p className="help-lead">¿Un error o una idea? Escríbela y mándala en un botón.</p>
      <div className="fb-field">
        <label>Tipo</label>
        <div className="fb-chips">
          {["Idea de mejora", "Reporte de error", "Contenido nuevo", "Otro"].map((t) => (
            <button key={t} className={"chip " + (tipo === t ? "chip-on" : "")} onClick={() => setTipo(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="fb-field">
        <label htmlFor="fbmsg">Tu mensaje</label>
        <textarea id="fbmsg" rows={6} value={msg} placeholder="Describe la mejora o el problema con detalle..." onChange={(e) => setMsg(e.target.value)} />
      </div>
      <div className="fb-actions">
        <a className={"btn-primary btn-lg " + (!msg.trim() ? "btn-disabled" : "")} href={msg.trim() ? mailto : undefined} onClick={(e) => !msg.trim() && e.preventDefault()}>
          <Send size={18} /> Enviar a mi correo
        </a>
        <button className="btn-outline" onClick={copyAll} disabled={!msg.trim()}><Copy size={16} /> {copied ? "Copiado" : "Copiar texto"}</button>
      </div>
      <p className="fb-note">El botón abre tu app de correo con el mensaje ya escrito hacia {EMAIL_DEV}. Si no se abre, usa "Copiar texto".</p>
    </div>
  );
}

/* ---------- CONSTANCIA ---------- */
function DoneView({ name, onBack, onFeedback }) {
  return (
    <div className="done">
      <div className="cert">
        <div className="cert-glow" />
        <Trophy size={40} className="cert-trophy" />
        <span className="cert-eyebrow">Constancia · {BRAND}</span>
        <h2 className="cert-name">{name || "Estudiante"}</h2>
        <p className="cert-rank">alcanzó el rango de <strong>Leyenda</strong></p>
        <p className="cert-text">Completó los {LEVELS.length} niveles: entender la máquina, hablarle bien, darle memoria, construir, analizar datos, integrar, automatizar, hacer negocio, enseñar y dominar.</p>
        <div className="cert-line" />
        <span className="cert-foot">{TAGLINE}</span>
      </div>
      <div className="done-next">
        <h3>¿Y ahora qué?</h3>
        <p>Ya no eres usuario. Eres alguien que entiende la herramienta a fondo. El siguiente paso real: construir tu portafolio y cerrar tu primer cliente.</p>
        <div className="done-btns">
          <button className="btn-outline" onClick={onBack}>Volver al mapa</button>
          <button className="btn-primary" onClick={onFeedback}>Sugerir una mejora</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ESTILOS
   ============================================================ */
function Styles() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
:root{
  --ink:#0B0F1A; --panel:#111827; --panel2:#1A2234; --panel3:#232E44;
  --amber:#F59E0B; --orange:#EA580C; --live:#10B981; --steel:#64748B; --steel2:#475569;
  --paper:#FBFAF7; --card:#FFFFFF; --line:#E7E4DC; --line2:#EDEBE4;
  --text:#1F2430; --dim:#6B7280; --dim2:#9AA1AE;
}
*{box-sizing:border-box;margin:0;padding:0}
.rc-root{font-family:'Inter',system-ui,sans-serif;background:var(--paper);color:var(--text);min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}
.loading{padding:80px;text-align:center;color:var(--dim);font-family:'JetBrains Mono',monospace}
.spin{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.topbar{position:sticky;top:0;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:var(--ink);color:#fff;border-bottom:1px solid #000}
.brand{display:flex;align-items:center;gap:8px;background:none;border:none;color:#fff;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px}
.brand-icon{color:var(--amber)}
.topbar-right{display:flex;align-items:center;gap:10px}
.rankpill{display:flex;align-items:center;gap:8px;background:var(--panel2);border:1px solid var(--panel3);border-radius:999px;padding:5px 12px}
.rankpill-label{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.04em}
.rankpill-pct{font-family:'JetBrains Mono',monospace;font-size:12px;color:#fff;font-weight:700}
.menu-btn{background:var(--panel2);border:1px solid var(--panel3);color:#fff;border-radius:10px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.dropdown{position:absolute;top:60px;right:14px;background:var(--panel);border:1px solid var(--panel3);border-radius:14px;padding:6px;display:flex;flex-direction:column;min-width:214px;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.dropdown button{display:flex;align-items:center;gap:10px;background:none;border:none;color:#E7EAF0;padding:12px;border-radius:9px;cursor:pointer;font-size:14px;font-family:inherit;text-align:left;width:100%}
.dropdown button:hover{background:var(--panel2)}
.dropdown .danger{color:#FCA5A5}
.dropdown .danger:hover{background:rgba(220,38,38,.15)}
.content{flex:1;width:100%;max-width:760px;margin:0 auto;padding:26px 18px 60px}
.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--orange);color:#fff;border:none;border-radius:11px;padding:12px 18px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;cursor:pointer;transition:transform .08s,background .15s;text-decoration:none}
.btn-primary:hover{background:#c2410c}
.btn-primary:active{transform:translateY(1px)}
.btn-primary:disabled,.btn-disabled{background:var(--steel);cursor:not-allowed;opacity:.7}
.btn-lg{padding:15px 22px;font-size:16px;width:100%}
.btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--card);color:var(--text);border:1.5px solid var(--line);border-radius:11px;padding:11px 16px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;cursor:pointer;text-decoration:none}
.btn-outline:hover{border-color:var(--orange);color:var(--orange)}
.btn-outline:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--dim);font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;cursor:pointer;padding:12px 8px}
.btn-ghost:hover{color:var(--text)}
.back{display:inline-flex;align-items:center;gap:4px;background:none;border:none;color:var(--dim);font-size:13px;cursor:pointer;margin-bottom:16px;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.03em}
.back:hover{color:var(--orange)}
.intro{max-width:620px;margin:0 auto;padding:40px 4px}
.intro-badge{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--orange);background:rgba(234,88,12,.08);border:1px solid rgba(234,88,12,.2);padding:6px 12px;border-radius:999px;margin-bottom:22px}
.intro-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(40px,10vw,64px);font-weight:700;line-height:.98;letter-spacing:-.03em;margin-bottom:8px}
.intro-tagline{font-family:'JetBrains Mono',monospace;font-size:15px;color:var(--amber);font-weight:500;margin-bottom:24px}
.intro-lead{font-size:17px;line-height:1.6;margin-bottom:34px}
.intro-steps{display:flex;flex-direction:column;gap:2px;margin-bottom:36px;border-left:2px solid var(--line)}
.intro-step{display:flex;gap:16px;padding:16px 0 16px 20px}
.intro-step-n{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:var(--orange);padding-top:2px;min-width:24px}
.intro-step h3{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:600;margin-bottom:3px}
.intro-step p{font-size:14px;color:var(--dim);line-height:1.5}
.intro-form{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px}
.intro-form label{display:block;font-size:14px;font-weight:500;margin-bottom:10px}
.intro-form input{width:100%;padding:13px 15px;border:1.5px solid var(--line);border-radius:11px;font-size:16px;font-family:inherit;margin-bottom:14px;background:var(--paper)}
.intro-form input:focus{outline:none;border-color:var(--orange)}
.map-head h2{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;letter-spacing:-.02em;margin-bottom:6px}
.map-head p{color:var(--dim);font-size:14px;margin-bottom:16px;line-height:1.5}
.progress{height:8px;background:var(--line2);border-radius:999px;overflow:hidden;margin-bottom:30px}
.progress-bar{height:100%;background:linear-gradient(90deg,var(--amber),var(--live));border-radius:999px;transition:width .5s ease}
.circuit{display:flex;flex-direction:column}
.node-row{display:flex;flex-direction:column;align-items:flex-start}
.trace{width:3px;height:26px;background:var(--line);margin-left:26px;border-radius:2px}
.trace-on{background:linear-gradient(180deg,var(--live),var(--amber))}
.node{display:flex;align-items:center;gap:15px;width:100%;text-align:left;cursor:pointer;background:var(--card);border:1.5px solid var(--line);border-radius:15px;padding:14px 15px;transition:transform .1s,border-color .15s,box-shadow .15s;font-family:inherit}
.node-open:hover{border-color:var(--orange);transform:translateX(3px);box-shadow:0 6px 20px rgba(234,88,12,.1)}
.node-locked{opacity:.6;cursor:not-allowed;background:var(--paper)}
.node-done{border-color:rgba(16,185,129,.4);background:linear-gradient(180deg,#fff,#f6fdfa)}
.node-dot{flex-shrink:0;width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--panel);color:#fff}
.node-open .node-dot{background:var(--ink)}
.node-done .node-dot{background:var(--live)}
.node-locked .node-dot{background:var(--steel2)}
.node-num{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:20px;color:var(--amber)}
.node-done .node-num{color:#fff}
.node-body{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
.node-rank{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--orange)}
.node-done .node-rank{color:var(--live)}
.node-title{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:17px;line-height:1.15}
.node-meta{font-size:12px;color:var(--dim2);font-family:'JetBrains Mono',monospace}
.node-score{color:var(--live);font-weight:700}
.node-arrow{color:var(--dim2);flex-shrink:0}
.node-open:hover .node-arrow{color:var(--orange)}
.node-pulse .node-dot{animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.5)}50%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}
.map-cta{margin-top:30px}
.level-head{margin-bottom:24px}
.level-code{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--orange)}
.level-head h2{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;letter-spacing:-.02em;margin:6px 0 10px}
.level-goal{font-size:15px;line-height:1.55;color:var(--dim);background:var(--card);border:1px solid var(--line);border-left:3px solid var(--amber);border-radius:0 10px 10px 0;padding:13px 16px}
.lesson-list-nav{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.lesson-item{display:flex;align-items:center;gap:12px;background:var(--card);border:1.5px solid var(--line);border-radius:12px;padding:14px 15px;cursor:pointer;font-family:inherit;text-align:left;transition:border-color .15s}
.lesson-item:hover{border-color:var(--orange)}
.lesson-check{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--dim2);flex-shrink:0}
.lesson-check.on{background:var(--live);border-color:var(--live);color:#fff}
.lesson-item-title{flex:1;font-weight:500;font-size:15px}
.lesson-item-arrow{color:var(--dim2)}
.level-quiz-box{display:flex;align-items:center;justify-content:space-between;gap:14px;background:var(--ink);border-radius:16px;padding:18px 20px;flex-wrap:wrap}
.level-quiz-info{display:flex;flex-direction:column;gap:3px;flex:1;min-width:180px}
.quiz-label{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;color:#fff}
.quiz-sub{font-size:13px;color:var(--dim2);line-height:1.4}
.lesson-counter{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--dim2);text-transform:uppercase;letter-spacing:.04em}
.lesson-title{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;letter-spacing:-.02em;margin:8px 0 22px;line-height:1.15}
.lesson-body{display:flex;flex-direction:column;gap:16px}
.lesson-p{font-size:16px;line-height:1.68}
.lesson-p strong,.lesson-list strong{font-weight:600;color:#000}
.lesson-sub{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;margin-top:6px}
.lesson-list{display:flex;flex-direction:column;gap:9px;padding-left:4px}
.lesson-list li{position:relative;padding-left:22px;font-size:15.5px;line-height:1.55}
.lesson-list li::before{content:"";position:absolute;left:4px;top:9px;width:6px;height:6px;background:var(--orange);border-radius:2px;transform:rotate(45deg)}
.callout{border-radius:13px;padding:16px 17px}
.callout p{font-size:15px;line-height:1.6;margin-top:8px}
.callout-tag{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:3px 9px;border-radius:6px}
.callout-note{background:rgba(245,158,11,.09);border:1px solid rgba(245,158,11,.28)}
.callout-note .callout-tag{background:var(--amber);color:#3a2a00}
.callout-note p strong{color:#7a4e00}
.callout-demo{background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.28)}
.callout-tag-demo{background:var(--live);color:#03301f}
.lesson-code{background:var(--ink);color:#D7E0EC;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.6;padding:16px;border-radius:12px;overflow-x:auto;white-space:pre;border:1px solid var(--panel3)}
.mark-read{margin-top:22px}
.read-badge{display:inline-flex;align-items:center;gap:7px;margin-top:22px;color:var(--live);font-weight:600;font-size:14px;font-family:'Space Grotesk',sans-serif}
.lesson-nav{display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding-top:20px;border-top:1px solid var(--line)}
.quiz-title{font-family:'Space Grotesk',sans-serif;font-size:25px;font-weight:700;letter-spacing:-.02em;margin:8px 0 6px}
.quiz-req{font-size:14px;color:var(--dim);margin-bottom:22px;line-height:1.5}
.result{display:flex;align-items:center;gap:14px;border-radius:14px;padding:16px 18px;margin-bottom:22px}
.result strong{display:block;font-family:'Space Grotesk',sans-serif;font-size:18px}
.result span{font-size:13px;font-family:'JetBrains Mono',monospace}
.result-pass{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.35);color:#047857}
.result-fail{background:rgba(234,88,12,.08);border:1px solid rgba(234,88,12,.3);color:#c2410c}
.quiz-questions{display:flex;flex-direction:column;gap:24px;margin-bottom:26px}
.q-text{font-size:16px;font-weight:500;line-height:1.5;margin-bottom:12px;display:flex;gap:10px}
.q-n{font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--orange);flex-shrink:0}
.q-opts{display:flex;flex-direction:column;gap:8px}
.opt{display:flex;align-items:center;gap:11px;text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:11px;padding:12px 14px;cursor:pointer;font-family:inherit;font-size:14.5px;color:var(--text);transition:border-color .12s,background .12s}
.opt:hover:not(:disabled){border-color:var(--steel)}
.opt-mark{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12px;width:22px;height:22px;border-radius:6px;background:var(--line2);color:var(--dim);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.opt-chosen{border-color:var(--orange);background:rgba(234,88,12,.05)}
.opt-chosen .opt-mark{background:var(--orange);color:#fff}
.opt-correct{border-color:var(--live);background:rgba(16,185,129,.08)}
.opt-correct .opt-mark{background:var(--live);color:#fff}
.opt-wrong{border-color:#dc2626;background:rgba(220,38,38,.06)}
.opt-wrong .opt-mark{background:#dc2626;color:#fff}
.opt:disabled{cursor:default}
.quiz-retry{text-align:center;margin-top:10px}
.quiz-retry p{color:var(--dim);font-size:14px;margin-bottom:14px}
.quiz-retry-btns{display:flex;gap:10px;justify-content:center}
.dojo-head{display:flex;align-items:center;gap:14px;margin-bottom:20px}
.dojo-icon{color:var(--orange);flex-shrink:0}
.dojo-head h2{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;letter-spacing:-.02em}
.dojo-head p{color:var(--dim);font-size:14px;line-height:1.4}
.dojo-tabs{display:flex;gap:8px;margin-bottom:22px;background:var(--line2);padding:5px;border-radius:12px}
.dojo-tab{flex:1;background:none;border:none;padding:10px;border-radius:9px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;color:var(--dim);cursor:pointer}
.dojo-tab.on{background:var(--card);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.06)}
.coach-scenario{font-size:13.5px;color:var(--dim);font-style:italic;margin-top:10px;line-height:1.5}
.ai-panel{margin-top:18px;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--orange);border-radius:0 13px 13px 0;padding:16px 18px}
.ai-panel-tag{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--orange);background:rgba(234,88,12,.08);padding:3px 9px;border-radius:6px;display:inline-block;margin-bottom:10px}
.ai-text p{font-size:14.5px;line-height:1.6;margin:2px 0}
.ai-text strong{font-weight:600;color:#000}
.ai-error{margin-top:16px;background:rgba(234,88,12,.06);border:1px solid rgba(234,88,12,.3);border-radius:12px;padding:16px}
.ai-error strong{display:block;font-family:'Space Grotesk',sans-serif;font-size:15px;color:#c2410c;margin-bottom:6px}
.ai-error p{font-size:13.5px;color:var(--text);line-height:1.5;margin-bottom:12px}
.tutor-empty{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:16px}
.tutor-empty p{font-size:14px;color:var(--dim);margin-bottom:12px}
.tutor-suggs{display:flex;flex-wrap:wrap;gap:8px}
.tutor-thread{display:flex;flex-direction:column;gap:12px;margin-bottom:14px;min-height:60px}
.bubble{max-width:88%;padding:12px 15px;border-radius:16px;font-size:14.5px;line-height:1.55}
.bubble-user{align-self:flex-end;background:var(--ink);color:#fff;border-bottom-right-radius:5px}
.bubble-ai{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:5px;display:flex;flex-direction:column}
.bubble-ai .ai-text p{margin:3px 0}
.bubble p{margin:0}
.tutor-input{display:flex;gap:8px;align-items:flex-end;position:sticky;bottom:0;background:var(--paper);padding-top:8px}
.tutor-input textarea{flex:1;padding:11px 13px;border:1.5px solid var(--line);border-radius:12px;font-size:15px;font-family:inherit;background:var(--card);resize:none;line-height:1.4}
.tutor-input textarea:focus{outline:none;border-color:var(--orange)}
.tutor-send{padding:12px 14px;flex-shrink:0}
.lab-cat{margin-bottom:26px}
.lab-cat-title{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--orange);margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--line)}
.lab-card{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:15px 16px;margin-bottom:12px}
.lab-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
.lab-card-head h4{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;margin-bottom:3px}
.lab-goal{font-size:13px;color:var(--dim);line-height:1.4}
.lab-copy{display:inline-flex;align-items:center;gap:6px;background:var(--paper);border:1.5px solid var(--line);border-radius:9px;padding:7px 11px;font-size:12.5px;font-weight:600;font-family:'Space Grotesk',sans-serif;color:var(--text);cursor:pointer;flex-shrink:0}
.lab-copy:hover{border-color:var(--orange);color:var(--orange)}
.lab-prompt{background:var(--ink);color:#D7E0EC;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.6;padding:14px;border-radius:10px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;border:1px solid var(--panel3)}
.help h2,.feedback h2,.done h2,.settings h2{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;letter-spacing:-.02em;margin-bottom:6px}
.help-lead{color:var(--dim);font-size:15px;margin-bottom:22px;line-height:1.5}
.help-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 19px;margin-bottom:14px}
.help-card h3{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;margin-bottom:12px;color:var(--orange);display:flex;align-items:center;gap:7px}
.help-card ul{display:flex;flex-direction:column;gap:9px}
.help-card li{position:relative;padding-left:20px;font-size:14.5px;line-height:1.55}
.help-card li::before{content:"";position:absolute;left:2px;top:8px;width:6px;height:6px;background:var(--amber);border-radius:2px;transform:rotate(45deg)}
.settings{padding-bottom:20px}
.settings-p{font-size:14.5px;line-height:1.6;color:var(--text);margin-bottom:12px}
.settings-input{width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:11px;font-size:15px;font-family:'JetBrains Mono',monospace;background:var(--paper);margin-bottom:14px}
.settings-input:focus{outline:none;border-color:var(--orange)}
.settings-actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.settings-note{font-size:12.5px;color:var(--dim2);line-height:1.5;background:var(--paper);padding:12px;border-radius:10px;border:1px solid var(--line)}
.fb-field{margin-bottom:20px}
.fb-field label{display:block;font-size:14px;font-weight:600;margin-bottom:10px}
.fb-chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{background:var(--card);border:1.5px solid var(--line);border-radius:999px;padding:9px 15px;font-size:13.5px;font-family:inherit;cursor:pointer;color:var(--dim)}
.chip-on{border-color:var(--orange);background:rgba(234,88,12,.06);color:var(--orange);font-weight:600}
.fb-field textarea{width:100%;padding:14px;border:1.5px solid var(--line);border-radius:12px;font-size:15px;font-family:inherit;background:var(--card);resize:vertical;line-height:1.5}
.fb-field textarea:focus{outline:none;border-color:var(--orange)}
.fb-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.fb-actions .btn-lg{flex:1;min-width:200px}
.fb-note{font-size:12.5px;color:var(--dim2);margin-top:14px;line-height:1.5}
.cert{position:relative;background:var(--ink);border-radius:20px;padding:40px 28px;text-align:center;color:#fff;overflow:hidden;margin-bottom:26px;border:1px solid var(--panel3)}
.cert-glow{position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:260px;height:260px;background:radial-gradient(circle,rgba(245,158,11,.35),transparent 70%);pointer-events:none}
.cert-trophy{color:var(--amber);margin-bottom:14px;position:relative}
.cert-eyebrow{display:block;font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--dim2);margin-bottom:8px}
.cert-name{font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;letter-spacing:-.02em;margin-bottom:6px}
.cert-rank{font-size:16px;color:#E7EAF0;margin-bottom:14px}
.cert-rank strong{color:var(--amber)}
.cert-text{font-size:14px;color:var(--dim2);line-height:1.6;max-width:440px;margin:0 auto}
.cert-line{height:1px;background:var(--panel3);margin:22px auto;max-width:180px}
.cert-foot{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--amber)}
.done-next{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px}
.done-next h3{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;margin-bottom:8px}
.done-next p{font-size:15px;line-height:1.6;color:var(--dim);margin-bottom:18px}
.done-btns{display:flex;gap:10px;flex-wrap:wrap}
.footer{text-align:center;padding:20px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--dim2);border-top:1px solid var(--line)}
@media (max-width:520px){
  .content{padding:20px 14px 50px}
  .node-dot{width:46px;height:46px}
  .level-quiz-box{flex-direction:column;align-items:stretch}
  .level-quiz-box .btn-primary{width:100%}
  .bubble{max-width:92%}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
    `}</style>
  );
}
