# SaludYa — Frontend de agendamiento médico

Aplicación web para la gestión de citas médicas de **SaludYa**: landing pública, registro, inicio de sesión (correo/contraseña, Gmail, Outlook/Hotmail, Apple), reserva de citas con reglas de agenda en Colombia, panel del paciente, portal médico y administración de usuarios.

Desarrollada con **React 19**, **Vite 7**, **React Router 7** y **Zustand**.

---

## Tabla de contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [Reglas de negocio — agenda](#reglas-de-negocio--agenda)
- [Autenticación](#autenticación)
- [Pruebas](#pruebas)
- [Build y despliegue](#build-y-despliegue)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Características

| Módulo | Descripción |
|--------|-------------|
| **Inicio** | Landing con hero, servicios, flujo de citas y modal «Cómo funciona» |
| **Registro** | Formulario con validación y aceptación de términos |
| **Login** | Paciente / Doctor / Admin; OAuth Gmail, Microsoft (Outlook/Hotmail) y Apple |
| **Reservar cita** | Calendario, franjas horarias, bloqueo de cupos ocupados |
| **Mis citas** | Próximas citas e historial |
| **Panel paciente** | Dashboard, salud y recetas |
| **Portal médico** | Cronograma y disponibilidad |
| **Admin** | Gestión de usuarios |
| **Responsive** | Navegación móvil y portal adaptable en escritorio/tablet/móvil |

---

## Requisitos

- **Node.js** 20.x o superior (recomendado LTS)
- **npm** 10+ (o pnpm/yarn compatibles)
- Navegador moderno (Chrome, Edge, Firefox)

Opcional para OAuth en producción:

- Proyecto en [Google Cloud Console](https://console.cloud.google.com/) (Gmail)
- Registro de aplicación en [Azure Portal](https://portal.azure.com/) (Outlook/Hotmail)

---

## Instalación

```bash
# Clonar o entrar al directorio del frontend
cd scheduling-appointments-front

# Instalar dependencias
npm install
# o con pnpm
pnpm install

# Copiar variables de entorno de ejemplo
copy .env.example .env   # Windows
# cp .env.example .env   # Linux / macOS

# Modo desarrollo
npm run dev
```

La aplicación queda disponible en **http://localhost:5173/**.

---

## Variables de entorno

Cree un archivo `.env` en la raíz del proyecto:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del API backend | `http://localhost:3000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID OAuth 2.0 (Gmail) | `xxx.apps.googleusercontent.com` |
| `VITE_MICROSOFT_CLIENT_ID` | Client ID Azure AD (Outlook/Hotmail) | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

Sin las claves OAuth, el inicio social funciona en **modo desarrollo** (validación de dominio `@gmail.com`, `@outlook.com`, `@hotmail.com`, etc.).

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint sobre el código |
| `npm run lint:fix` | ESLint con corrección automática |
| `npm test` | Ejecuta todas las pruebas (unitarias + integración) |
| `npm run test:watch` | Pruebas en modo observación |
| `npm run test:unit` | Solo pruebas unitarias |
| `npm run test:integration` | Solo pruebas de integración |
| `npm run test:coverage` | Informe de cobertura |

---

## Estructura del proyecto

```
scheduling-appointments-front/
├── public/
├── src/
│   ├── components/       # UI reutilizable (layout, booking, auth, …)
│   ├── config/           # MSAL y configuración
│   ├── design-system/    # Button, Input
│   ├── hooks/            # AuthProvider, useAuth
│   ├── pages/            # Pantallas por ruta (orden del diseño PDF)
│   ├── services/         # API axios
│   ├── store/            # Zustand (auth, reservas)
│   ├── styles/           # saludya.css y tokens
│   └── utils/            # Festivos CO, agenda, OAuth helpers
├── tests/
│   ├── setup.js          # Configuración global Vitest
│   ├── helpers/          # renderApp, seeds de store
│   ├── unit/             # Pruebas unitarias
│   └── integration/      # Flujos completos
├── docs/
│   └── pdf-pages/        # Referencia visual del diseño
├── .env.example
├── vite.config.js
└── README.md
```

---

## Rutas de la aplicación

Orden alineado al diseño del producto:

| # | Ruta | Pantalla | Acceso |
|---|------|----------|--------|
| 1 | `/` | Inicio (landing) | Público |
| 2 | `/register` | Registro | Público |
| 3 | `/login` | Inicio de sesión | Público |
| 4 | `/book` | Reservar cita | Autenticado |
| 5 | `/appointments` | Mis citas | Autenticado |
| 6 | `/dashboard` | Panel del paciente | Autenticado |
| 7 | `/doctor` | Portal médico | Autenticado |
| 8 | `/profile` | Perfil del usuario | Autenticado |
| 9 | `/admin` | Gestión de usuarios | Autenticado |

Rutas adicionales del portal médico:
- `/doctor/calendar` — Calendario médico
- `/doctor/appointments` — Citas médicas
- `/doctor/users` — Pacientes y usuarios
- `/doctor/analytics` — Análisis y métricas
- `/doctor/settings` — Configuración del médico

Redirecciones: `/home` → `/dashboard`, `/calendar` → `/book`.

---

## Reglas de negocio — agenda

- **Lunes a viernes:** 8:00 a. m. – 12:00 m. y 1:00 p. m. – 5:00 p. m. (franjas cada 30 min).
- **Sábados:** solo 8:00 a. m. – 12:00 m.
- **Domingos y festivos de Colombia:** sin disponibilidad.
- **Cupos ocupados:** si el profesional ya tiene cita en una franja, se muestra en gris, solo lectura («No disponible») y no se puede reservar.
- Las reservas se persisten en `localStorage` (`saludya-bookings`) hasta conectar el API real.

Festivos definidos en `src/utils/colombianHolidays.js`.

---

## Autenticación

1. **Correo y contraseña** — integración con `POST /auth/login` (fallback mock sin backend).
2. **Gmail** — Google OAuth (`@react-oauth/google`) o modo desarrollo con dominio `@gmail.com`.
3. **Outlook / Hotmail** — Microsoft MSAL (`@azure/msal-browser`) o modo desarrollo con dominios Microsoft.
4. **Apple** — inicio de sesión social con Apple en modo de prueba.

El rol elegido en login (Paciente / Doctor / Administrador) define la redirección inicial al panel correspondiente. El sistema valida que el usuario autenticado tenga el rol correcto y, si no coincide, muestra un mensaje para verificar credenciales y bloquea el acceso.

El frontend es completamente responsive: el navbar principal se adapta a móviles con menú colapsable, y el portal médico utiliza un sidebar overlay en pantallas pequeñas. Además, el avatar de usuario muestra un menú rápido con opciones de `Perfil` y `Cerrar sesión`.

Credenciales de administrador de sistema de prueba:
- Usuario: `admin@saludya.com`
- Contraseña: `Admin1234+`

Si el backend no está disponible, el auth cae en un modo mock que permite probar los flujos básicos con datos locales.

---

## Pruebas

Stack: **Vitest**, **Testing Library**, **jsdom**.

```bash
# Todas las pruebas
npm test

# Solo unitarias
npm run test:unit

# Solo integración
npm run test:integration

# Cobertura
npm run test:coverage
```

### Estructura de pruebas

```
tests/
├── setup.js
├── helpers/
│   ├── test-utils.jsx      # renderApp, renderWithProviders
│   └── store.js            # seed de auth y reservas
├── unit/
│   ├── utils/              # festivos, agenda, socialAuth
│   ├── components/         # TimeSlot, timeSlotStatus
│   ├── store/              # appointmentsBookingStore
│   ├── services/           # authApi
│   └── design-system/      # Button, Input
└── integration/
    ├── mocks/authApi.mock.js
    ├── routing.test.jsx
    ├── auth-flow.test.jsx
    ├── booking-flow.test.jsx
    └── landing.test.jsx
```

### Qué cubren las pruebas

- **Unitarias:** lógica de festivos, generación de franjas, validación de correos OAuth, store de reservas (doble booking), componente `TimeSlot`, API de auth en modo mock.
- **Integración:** navegación y rutas protegidas, flujo de login/logout, reserva con franjas ocupadas y confirmación, modal «Cómo funciona».

---

## Build y despliegue

```bash
npm run build
```

Los artefactos estáticos quedan en `dist/`. Puede desplegar en cualquier hosting estático (Netlify, Vercel, S3, nginx, etc.) configurando fallback a `index.html` para SPA.

```bash
npm run preview   # Probar el build localmente
```

---

## Contribución

1. Cree una rama desde `main`.
2. Ejecute `npm run lint` y `npm test` antes del PR.
3. Siga convenciones de commits ([Conventional Commits](https://www.conventionalcommits.org/)) — el proyecto usa Commitlint + Husky.

---

## Licencia

Proyecto privado — SaludYa. Consulte con el equipo propietario antes de redistribuir.

---

## Soporte

Para incidencias técnicas, documente pasos para reproducir, navegador, y salida de `npm test` si aplica.

**Versión del paquete:** ver `package.json` (`version`).
