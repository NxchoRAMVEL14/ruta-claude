# Ruta Claude

Curso interactivo para dominar Claude, de novato a leyenda. 10 niveles con candados por examen, Dojo con IA integrada (coach de prompts + tutor), laboratorio de retos prácticos y constancia final.

---

## 1. Personaliza antes de publicar

Abre `src/App.jsx` y edita, hasta arriba, estas líneas:

```javascript
const BRAND = "Ruta Claude";              // el nombre que verá tu cliente
const TAGLINE = "De novato a leyenda";    // frase corta
const EMAIL_DEV = "TU-CORREO@gmail.com";  // ← tu correo (llega el feedback del botón)
const AI_MODEL = "claude-sonnet-4-6";     // modelo del Dojo IA
```

Lo único obligatorio es `EMAIL_DEV`. Lo demás es opcional.

---

## 2. Correr en tu computadora

```bash
npm install
npm run dev
```

Abre la dirección que te muestre (normalmente http://localhost:5173).

---

## 3. Publicar en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `ruta-claude`).
2. En `vite.config.js`, asegúrate de que `base` sea el nombre EXACTO de tu repo, con diagonales: `base: "/ruta-claude/"`.
3. Sube el proyecto al repo (git add / commit / push).
4. Instala y despliega:

```bash
npm install
npm run build
npm run deploy
```

5. En GitHub → tu repo → **Settings → Pages** → confirma que la fuente sea la rama `gh-pages`.

En un par de minutos estará vivo en: `https://TU-USUARIO.github.io/ruta-claude/`

---

## 4. Cómo funciona la IA integrada (léelo, es importante)

El Dojo IA llama a la API de Anthropic. El comportamiento cambia según dónde corra la app:

- **Dentro de Claude (artifact):** funciona **sin API key**, sin configurar nada.
- **En GitHub Pages / tu propio sitio:** cada usuario debe pegar su propia API key en **Ajustes**. Se guarda solo en su navegador y se usa directo contra la API de Anthropic.

El código ya detecta el entorno y hace lo correcto en cada caso. No tienes que cambiar nada.

### Si vas a vender la app y no quieres que cada usuario ponga su key

Monta un pequeño **proxy** (una función serverless en Vercel o Cloudflare Workers) que guarde TU key del lado del servidor y reciba las llamadas de la app. Así tus usuarios no necesitan key propia. Pasos generales:

1. Crea una función que reciba el body y lo reenvíe a `https://api.anthropic.com/v1/messages` agregando tu `x-api-key` del lado servidor.
2. En `src/App.jsx`, dentro de `callAI`, cambia la URL del `fetch` por la de tu proxy y quita el envío de la key desde el navegador.

> Ojo: si haces esto, TU key paga el consumo de todos los usuarios. Contrólalo con límites y, si cobras, cúbrelo en tu precio.

---

## 5. Almacenamiento del progreso

- Dentro de Claude usa el almacenamiento del artifact.
- En GitHub Pages usa `localStorage` del navegador.

El progreso es por dispositivo/navegador. No hay servidor de cuentas.

---

## 6. Monetización

Revisa el archivo aparte **GUIA_GitHub_y_Monetizacion.md** que viene con tu entrega. Resumen:

- **Venta directa** del acceso (Mercado Pago, Stripe, Gumroad).
- **Anzuelo:** regala la app para cerrar consultorías (lo más rentable para ti).
- **Marca blanca:** véndele a una empresa su propia app cambiando 3 líneas.
- **Suscripción / cohortes.**

---

Hecho para Nacho. Ajusta, publica y véndelo.
