# 🇧🇴 Aqui Canta Bolivia — Plataforma Monorepo

<div align="center">

![Turborepo](https://img.shields.io/badge/Turborepo-2.x-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.2+-000000?style=for-the-badge&logo=bun&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-Deployable-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

<p align="center">
  Arquitectura monorepo moderna, modular y reproducible para el ecosistema <strong>Aqui Canta Bolivia</strong>.
  <br />
  Diseñada para ofrecer máxima velocidad de desarrollo local con <strong>Bun</strong> y <strong>Turborepo</strong>, y despliegues productivos independientes en <strong>Railway</strong> o cualquier infraestructura basada en <strong>Docker</strong>.
</p>

</div>

---

## 📑 Tabla de Contenidos

1. [Visión General y Arquitectura](#-visión-general-y-arquitectura)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Requisitos Previos](#-requisitos-previos)
5. [Variables de Entorno](#-variables-de-entorno)
6. [Flujo de Desarrollo Local](#-flujo-de-desarrollo-local)
   - [Modo Híbrido (Recomendado para DX Rápido)](#1-modo-híbrido-recomendado-para-dx-rápido)
   - [Modo 100% Contenedorizado en Docker](#2-modo-100-contenedorizado-en-docker)
7. [Gestión de Base de Datos y Prisma](#-gestión-de-base-de-datos-y-prisma)
8. [Documentación de la API (NestJS + Swagger)](#-documentación-de-la-api-nestjs--swagger)
9. [Frontend Web (Next.js 15)](#-frontend-web-nextjs-15)
10. [Flujo de Trabajo con Git](#-flujo-de-trabajo-con-git)
11. [Guía de Despliegue en Railway](#-guía-de-despliegue-en-railway)
12. [Tabla de Scripts y Comandos](#-tabla-de-scripts-y-comandos)
13. [Resolución de Problemas Frecuentes](#-resolución-de-problemas-frecuentes)

---

## 🏛️ Visión General y Arquitectura

El proyecto está estructurado bajo el paradigma de **Monorepo gestionado por Turborepo**:

- **Aislamiento y Reutilización**: Los esquemas de base de datos, configuraciones de TypeScript y reglas de ESLint están centralizados en paquetes (`packages/*`), evitando duplicación de código.
- **Compilación Incremental y Caché**: Turborepo almacena en caché las tareas completadas (`build`, `lint`, `check-types`), reduciendo drásticamente los tiempos de CI/CD.
- **Portabilidad Total**: Todo el stack puede correr en local con dependencias nativas o dentro de contenedores Docker aislados, garantizando paridad entre desarrollo y producción.

---

## 📂 Estructura del Proyecto

```
AquiCantaBolivia/
├── apps/
│   ├── api/                          # ⚙️ Backend API (NestJS 11)
│   │   ├── src/
│   │   │   ├── prisma/               # Servicio y Módulo Prisma (Lifecycle hooks)
│   │   │   ├── app.controller.ts     # Controladores principales (/health, /summary)
│   │   │   ├── app.service.ts        # Lógica de negocio y consultas DB
│   │   │   └── main.ts               # Bootstrap con Swagger, CORS y validaciones
│   │   ├── Dockerfile                # Multi-stage Dockerfile con turbo prune
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # 🌐 Frontend Web (Next.js 15 App Router + Tailwind v4)
│       ├── public/                   # Recursos estáticos
│       ├── src/
│       │   ├── app/                  # Rutas — ver sección "Frontend Web" para el mapa completo
│       │   │   ├── layout.tsx        # Layout raíz: <Navbar /> + <Footer /> para toda la app
│       │   │   ├── page.tsx          # "/" — dashboard interactivo con status en vivo
│       │   │   └── globals.css       # Estilos globales + `@import 'tailwindcss'`
│       │   ├── components/           # Componentes reutilizables (Navbar, Footer, PageHeading...)
│       │   └── lib/
│       │       └── routes.ts         # Único lugar con las URLs del sitio
│       ├── Dockerfile                # Multi-stage Dockerfile con salida standalone
│       ├── next.config.mjs           # Configuración con outputFileTracingRoot
│       ├── postcss.config.mjs        # Plugin de Tailwind v4
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── database/                     # 🗄️ Capa de Base de Datos Compartida
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Modelos PostgreSQL (User, Artist, Song)
│   │   ├── src/
│   │   │   └── index.ts              # Exportación singleton PrismaClient y tipos
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── typescript-config/            # 📘 Configuraciones TypeScript Compartidas
│   │   ├── base.json                 # Configuración general
│   │   ├── nestjs.json               # Optimizada para decoradores NestJS
│   │   ├── nextjs.json               # Optimizada para Next.js App Router
│   │   └── package.json
│   │
│   └── eslint-config/                # 🧹 Reglas ESLint Compartidas
│       ├── index.js
│       └── package.json
│
├── .env.example                      # Plantilla de variables de entorno
├── .gitignore                        # Reglas de exclusión de Git
├── docker-compose.yml                # Orquestador completo (Postgres, Adminer, API, Web)
├── docker-compose.dev.yml            # Orquestador liviano para base de datos local
├── package.json                      # Configuración de workspaces raíz con Bun
├── README.md                         # Documentación técnica del sistema
└── turbo.json                        # Pipeline de tareas y dependencias de Turbo
```

---

## 💻 Stack Tecnológico

| Componente | Tecnología | Versión | Propósito |
| :--- | :--- | :--- | :--- |
| **Monorepo Manager** | [Turborepo](https://turbo.build/) | `^2.4` | Orquestación de tareas, pipelines y caché |
| **Package Manager** | [Bun](https://bun.sh/) | `^1.2` | Gestor de paquetes ultrarrápido y runtime |
| **Backend Framework** | [NestJS](https://nestjs.com/) | `^11.0` | API REST modular, inyección de dependencias y Swagger |
| **Frontend Framework** | [Next.js](https://nextjs.org/) | `^15.1` | App Router, Server Components y salida standalone |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com/) | `^4.3` | Utility-first CSS, configurado vía PostCSS sin `tailwind.config.js` |
| **ORM** | [Prisma](https://www.prisma.io/) | `^6.4` | Tipado estricto, migraciones seguras y query builder |
| **Base de Datos** | [PostgreSQL](https://www.postgresql.org/) | `16 Alpine` | Base de datos relacional principal |
| **Containerización** | [Docker](https://www.docker.com/) | `24+` | Contenedores reproducibles y multi-stage builds |
| **DB Admin UI** | [Adminer](https://www.adminer.org/) | `Latest` | Panel visual web para inspección de base de datos |

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalados en tu sistema:

1. **Bun**:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   # Verificar versión
   bun --version # >= 1.2.0
   ```
2. **Node.js**: `v20.x` o `v22.x` (usado por Next.js / NestJS en runtime)
3. **Docker & Docker Compose**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) en ejecución.

---

## 🔐 Variables de Entorno

El proyecto utiliza un archivo central `.env` en la raíz del repositorio. Copia la plantilla base:

```bash
cp .env.example .env
```

### Configuración del archivo `.env`:

```env
# ==============================================
# Base de Datos PostgreSQL
# ==============================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aquicantabolivia?schema=public"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="aquicantabolivia"

# ==============================================
# Backend API (NestJS)
# ==============================================
PORT=4000
NODE_ENV=development

# ==============================================
# Frontend Web (Next.js)
# ==============================================
NEXT_PUBLIC_API_URL="http://localhost:4000"
PORT_WEB=3000
```

---

## 🚀 Flujo de Desarrollo Local

### 1. Modo Híbrido (Recomendado para DX Rápido)

En este modo, Docker únicamente administra la base de datos PostgreSQL y la interfaz web Adminer, mientras que las aplicaciones (`api` y `web`) corren nativamente en tu máquina con **Bun** y **Turborepo** para un hot-reload instantáneo.

#### Paso A: Instalar dependencias
```bash
bun install
```

#### Paso B: Levantar PostgreSQL en Docker
```bash
docker compose up -d postgres adminer
```

#### Paso C: Aplicar las migraciones existentes a la base de datos
```bash
bun run db:deploy
```

#### Paso D: Iniciar todo el entorno con Turborepo
```bash
bun run dev
```

> **Nota — `docker-compose.dev.yml`:** este archivo levanta un Postgres y Adminer *aislados* (contenedores y volumen con nombres `_dev`, credenciales fijas `postgres/postgres`), completamente separados de los datos que uses en el Modo 100% Contenedorizado. Úsalo en vez del Paso B si quieres una base de datos de desarrollo independiente, sin arriesgar los datos de tu entorno "productivo" local:
> ```bash
> docker compose -f docker-compose.dev.yml up -d
> ```
> Si usas este archivo, tu `.env` debe apuntar a `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aquicantabolivia?schema=public"` (igual que el valor por defecto de `.env.example`), ya que expone el mismo puerto `5432`.

---

### 2. Modo 100% Contenedorizado en Docker

Si prefieres no ejecutar nada en tu sistema anfitrión y levantar todos los servicios dentro de Docker:

```bash
# Construir y levantar todos los contenedores (Postgres, Adminer, API, Web)
docker compose up --build

# Para ejecutar en segundo plano
docker compose up -d --build

# Ver logs en tiempo real
docker compose logs -f

# Apagar todos los servicios
docker compose down
```

---

## 🌐 URLs y Puertos del Sistema

| Servicio | URL | Descripción |
| :--- | :--- | :--- |
| 🌐 **Frontend Web** | [http://localhost:3000](http://localhost:3000) | Aplicación Next.js 15 (Dashboard interactivo) |
| ⚙️ **Backend API** | [http://localhost:4000](http://localhost:4000) | Endpoints REST de NestJS |
| 📚 **Swagger Docs** | [http://localhost:4000/docs](http://localhost:4000/docs) | Documentación OpenAPI interactiva |
| 🗄️ **Adminer (DB UI)** | [http://localhost:8080](http://localhost:8080) | Gestor web para consultar PostgreSQL |
| 🐘 **PostgreSQL Port** | `localhost:5432` | Conexión directa para DBeaver, TablePlus, etc. |

> **Credenciales para ingresar a Adminer:**
> - **Sistema:** PostgreSQL
> - **Servidor:** `postgres` (si ingresas desde Docker) o `localhost` (si te conectas desde el host)
> - **Usuario:** `postgres`
> - **Contraseña:** `postgres`
> - **Base de datos:** `aquicantabolivia`

---

## 🗄️ Gestión de Base de Datos y Prisma

La base de datos se gestiona desde el paquete compartido [`packages/database`](file:///Users/rodrigoesprella/Documents/2026/Futuro/AquiCantaBolivia/packages/database).

### Modelos Definidos (`schema.prisma`):
- `User`: Usuarios del sistema con roles (`USER`, `ARTIST`, `ADMIN`).
- `ArtistProfile`: Perfil público de artistas musicales con biografía y datos de origen.
- `Song`: Canciones registradas asociadas a los perfiles de artistas.

El proyecto usa **Prisma Migrate** como fuente de verdad del esquema: cada cambio queda registrado como un archivo SQL versionado en [`packages/database/prisma/migrations`](packages/database/prisma/migrations), y el contenedor de la API aplica automáticamente las migraciones pendientes cada vez que arranca (ver Dockerfile de `api`). Esto significa que un `docker compose up` o un deploy en Railway contra una base de datos completamente nueva funcionan sin ningún paso manual extra.

### Comandos de Base de Datos:

```bash
# 1. Regenerar el cliente tipado de Prisma tras cambios en schema.prisma
bun run db:generate

# 2. Crear una nueva migración a partir de cambios en schema.prisma (uso normal en desarrollo)
bun run db:migrate

# 3. Aplicar migraciones pendientes sin generar una nueva (lo que corre automáticamente
#    en el contenedor de la API al arrancar; útil también para CI o un entorno remoto)
bun run db:deploy

# 4. Abrir la interfaz visual oficial de Prisma Studio en el navegador
bun run db:studio
```

> ⚠️ **`bun run db:push`** sigue disponible (aplica el `schema.prisma` directamente sin crear una migración), pero **no lo uses una vez que ya existan migraciones** en `prisma/migrations` — mezclar ambos flujos genera "drift" entre el historial de migraciones y el estado real de la base, y Prisma se negará a crear nuevas migraciones hasta resolverlo (potencialmente pidiendo resetear la base). Para cualquier cambio de schema a partir de ahora, usa `bun run db:migrate`.

---

## 📚 Documentación de la API (NestJS + Swagger)

La API cuenta con soporte nativo de **Swagger (OpenAPI)** generado dinámicamente:

- **Ruta de documentación:** [http://localhost:4000/docs](http://localhost:4000/docs)
- **Endpoints base incluidos:**
  - `GET /health`: Comprueba el estado de la API y efectúa un ping en tiempo real a PostgreSQL.
  - `GET /summary`: Retorna el listado de artistas y canciones registradas.

---

## 🌐 Frontend Web (Next.js 15)

Esta sección es la referencia obligatoria para trabajar en [`apps/web`](apps/web) — tanto para el equipo como para dar contexto a un agente de IA antes de pedirle que toque este código. Define la arquitectura y las convenciones que **todos** deben seguir para que el proyecto crezca ordenado.

### Stack de la capa web

- **Next.js 15** con **App Router** (carpetas dentro de `src/app`, no el viejo `pages/`).
- **TypeScript** en modo estricto (heredado de `@repo/typescript-config/nextjs.json`).
- **Tailwind CSS v4** para todos los estilos nuevos. Se configura distinto a versiones anteriores:
  - No hay `tailwind.config.js`. La v4 no lo requiere para uso básico.
  - `postcss.config.mjs` solo registra el plugin `@tailwindcss/postcss`.
  - `src/app/globals.css` activa Tailwind con `@import 'tailwindcss';` (después de cualquier otro `@import`, como el de Google Fonts — CSS exige que los `@import` vayan en orden al inicio del archivo).
  - Usa clases utilitarias de Tailwind directamente en el JSX (`className="flex gap-4 text-slate-300"`). No se agregan más estilos globales en `globals.css` salvo que sea algo realmente compartido por toda la app.

### Estructura de carpetas de `apps/web/src`

```
src/
├── app/                    # Rutas (App Router). Cada carpeta = un segmento de URL.
│   ├── layout.tsx          # Layout raíz: envuelve TODA la app con <Navbar /> y <Footer />
│   ├── page.tsx             # "/"
│   ├── categorias/
│   │   ├── page.tsx         # "/categorias"        → listado de categorías
│   │   └── [slug]/page.tsx  # "/categorias/:slug"  → detalle: participantes de esa categoría
│   ├── cantante/
│   │   ├── page.tsx         # "/cantante"           → listado de todos los cantantes
│   │   └── [slug]/page.tsx  # "/cantante/:slug"     → ficha de un cantante
│   ├── grupo/                # mismo patrón que cantante/
│   ├── adminpanel/
│   │   ├── page.tsx          # "/adminpanel"
│   │   ├── usuarios/page.tsx
│   │   ├── inscritos/page.tsx
│   │   ├── categorias/page.tsx
│   │   └── resultados/page.tsx
│   └── ... (inscripciones, asientos-reserva, realidad-virtual, votacion-previa,
│            votacion-vivo, calificacion-jurado, login, registro, perfil)
├── components/              # Componentes de React reutilizables (no son rutas)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── PageHeading.tsx
├── lib/
│   └── routes.ts            # Único lugar con las URLs del sitio (ver más abajo)
└── globals.css
```

**Regla de oro:** una carpeta dentro de `app/` con un `page.tsx` es una página real y pública apenas se crea — Next.js la enruta automáticamente. No hace falta registrar rutas en ningún otro lado.

### Patrón listado + detalle (`page.tsx` junto a `[slug]/page.tsx`)

Varias secciones combinan un listado y una ficha de detalle en la misma carpeta padre, y **ambos archivos coexisten sin conflicto**:

```
app/cantante/page.tsx           →  /cantante          (lista todos los cantantes)
app/cantante/[slug]/page.tsx    →  /cantante/mi-slug   (ficha de un cantante)
```

Mismo patrón en `categorias/` y `grupo/`. Al crear una sección nueva que necesite listado + detalle, replica esta estructura en vez de inventar una convención distinta.

### `lib/routes.ts` — nunca hardcodear una URL

Todas las rutas del sitio están centralizadas en un solo objeto:

```ts
import { ROUTES } from '@/lib/routes';

<Link href={ROUTES.categorias}>Categorías</Link>
<Link href={ROUTES.admin.usuarios}>Usuarios</Link>
```

Si necesitas enlazar a una página, **importa de `ROUTES`**, no escribas el string `"/categorias"` a mano en el componente. Si agregas una ruta nueva, agrégala primero a este archivo. Esto evita el típico bug de "cambié la URL en un lado y me olvidé de actualizarla en el menú".

### El alias `@/`

`tsconfig.json` ya mapea `@/*` a `src/*`. Importa siempre así, nunca con rutas relativas largas:

```ts
// bien
import { ROUTES } from '@/lib/routes';
import { Navbar } from '@/components/Navbar';

// evitar
import { ROUTES } from '../../../lib/routes';
```

### Componentes: cuándo crear uno y dónde ponerlo

- Si un pedazo de UI se repite en 2 o más páginas (o es evidente que se va a repetir), sácalo a `src/components/` como su propio componente. Hoy solo existen `Navbar`, `Footer` y `PageHeading` — a medida que el equipo construya páginas reales, esta carpeta va a crecer con cosas como tarjetas de participante, formularios, etc. Cuando `components/` empiece a tener muchos archivos sin relación entre sí, es momento de subagruparlos (ej. `components/ui/` para primitivos visuales, `components/features/<seccion>/` para componentes específicos de una sección) — no antes, para no crear carpetas vacías "por si acaso".
- Un componente por archivo, nombre en PascalCase igual al archivo (`ParticipanteCard.tsx` exporta `ParticipanteCard`).
- Si un componente necesita datos del backend, ese fetch va en el componente o en un hook dentro de `src/hooks/` (crear esa carpeta cuando exista el primer hook) — nunca dupliques la misma llamada `fetch` en dos componentes distintos.

### Estado actual de las páginas (importante)

Todas las páginas creadas hasta ahora son **placeholders vacíos**: solo renderizan `<PageHeading title="..." />`, que muestra el mensaje "Página X". Esto es intencional — es la base de rutas y arquitectura, no el contenido final. Cuando alguien del equipo tome una página para desarrollarla:

1. Reemplaza el `<PageHeading />` por el contenido real.
2. Reutiliza componentes de `components/` en vez de copiar/pegar JSX de otra página.
3. Si la página necesita datos de la API (`apps/api`), usa `process.env.NEXT_PUBLIC_API_URL` como base (mismo patrón que ya usa `app/page.tsx` para llamar a `/health`).
4. Las secciones `/adminpanel/*`, `/perfil` y `/calificacion-jurado` van a necesitar autenticación y control de acceso por rol (`USER`, `ARTIST`, `JURADO`, `ADMIN`) — eso todavía no está implementado ni en el frontend ni en la API, es trabajo pendiente antes de que esas páginas sean funcionales de verdad.

### Mapa de rutas actual

| Ruta | Descripción |
| :--- | :--- |
| `/` | Inicio |
| `/categorias` | Listado de categorías |
| `/categorias/:slug` | Participantes de una categoría |
| `/cantante` | Listado de cantantes |
| `/cantante/:slug` | Ficha de un cantante |
| `/grupo` | Listado de grupos |
| `/grupo/:slug` | Ficha de un grupo |
| `/inscripciones` | Formulario de inscripción al concurso |
| `/asientos-reserva` | Reserva de asientos para el evento en vivo |
| `/realidad-virtual` | Experiencia de recorrido virtual |
| `/votacion-previa` | Votación previa a la final |
| `/votacion-vivo` | Votación durante la transmisión en vivo |
| `/calificacion-jurado` | Panel de calificación (rol jurado) |
| `/login` | Inicio de sesión |
| `/registro` | Creación de cuenta |
| `/perfil` | Panel de la cuenta del usuario |
| `/adminpanel` | Dashboard del panel de administración |
| `/adminpanel/usuarios` | Administración de usuarios |
| `/adminpanel/inscritos` | Administración de inscritos |
| `/adminpanel/categorias` | Administración de categorías |
| `/adminpanel/resultados` | Administración de resultados |

---

## 🔀 Flujo de Trabajo con Git

Esta es la referencia obligatoria de cómo el equipo mueve código de una laptop a producción. Dos ramas viven para siempre; todo lo demás es una rama corta que nace y muere alrededor de una tarea de Jira.

### Las dos ramas largas

| Rama | Qué es | Quién le pushea directo |
| :--- | :--- | :--- |
| `main` | Producción. Lo que ve el público. | Nadie — solo entra por PR desde `dev`. |
| `dev` | Integración. Donde el equipo junta el trabajo del sprint antes de que esté listo para producción. | Nadie — solo entra por PR desde ramas `feature/*` o `fix/*`. |

No usamos Git Flow completo (con `release/`, `support/`, etc.) — es demasiada ceremonia para un equipo de 3 personas con sprints de 1 semana. Dos ramas largas + ramas cortas por tarea cubre todo lo que necesitamos.

### Ramas cortas (nacen de una tarea, se borran al mergear)

- **`feature/<código>-<slug>`** — una por historia de Jira. Sale de `dev`, vuelve a `dev`. Ej: `feature/VJ-2-votacion-previa`, `feature/CG-1-mock-data`.
- **`fix/<código>-<slug>`** — mismo flujo, para bugs encontrados durante el sprint.
- **`hotfix/<slug>`** — la única excepción a "todo pasa por dev": para un bug urgente ya en producción. Sale directo de `main`, se mergea a `main`, y ese mismo cambio se mergea también a `dev` para que no queden desincronizadas.

El prefijo con el código de Jira (`HP-1`, `CG-3`, `VJ-2`, ver el backlog del Sprint 1) no es decorativo: cualquiera identifica qué historia resuelve una rama con solo ver su nombre, y si más adelante se conecta Jira con GitHub, el vínculo entre ticket y PR es automático.

### Flujo del día a día

```bash
# 1. Siempre arrancar una tarea nueva desde dev actualizado
git checkout dev
git pull

# 2. Crear la rama de la tarea
git checkout -b feature/VJ-2-votacion-previa

# 3. Trabajar y commitear normalmente
git push -u origin feature/VJ-2-votacion-previa

# 4. Abrir el Pull Request hacia dev (NUNCA hacia main)
```

**Antes de mergear cualquier PR:**
- Al menos un compañero de equipo lo revisó y aprobó.
- El build pasa limpio (`bun run build` y `bun run check-types`).
- Cumple el resto del Definition of Done de la historia (ver el tablero del sprint).

Al mergear, borra la rama (`feature/*`/`fix/*` no deberían sobrevivir más de unos días).

### Promoción `dev` → `main`

Cuando hay un incremento estable y demostrado al equipo (normalmente al cierre del sprint), se abre un Pull Request de `dev` hacia `main`. Antes de abrirlo:

- El build de todo el monorepo pasa limpio.
- Lo que se va a promover ya se demostró (ej. en el demo/retro del sprint).
- No hay bugs conocidos bloqueantes.

Después de mergear a `main`, es buena práctica etiquetar un release (`git tag v0.1.0`) como checkpoint — así siempre se puede volver a un punto exacto si algo sale mal en producción.

---

## 🚂 Guía de Despliegue en Railway

Este repositorio está preparado para desplegarse en **Railway** con arquitectura multi-servicio independiente a partir de un único repositorio.

```
                  ┌───────────────────────────────┐
                  │      Railway Project          │
                  │                               │
                  │   ┌───────────────────────┐   │
                  │   │  PostgreSQL Plugin    │   │
                  │   └──────────┬────────────┘   │
                  │              │ (DATABASE_URL) │
                  │              ▼                │
                  │   ┌───────────────────────┐   │
                  │   │   API (NestJS)        │   │
                  │   │ apps/api/Dockerfile   │   │
                  │   └──────────┬────────────┘   │
                  │              │ (API_URL)      │
                  │              ▼                │
                  │   ┌───────────────────────┐   │
                  │   │   Web (Next.js 15)    │   │
                  │   │ apps/web/Dockerfile   │   │
                  │   └───────────────────────┘   │
                  └───────────────────────────────┘
```

### Paso 1: Crear la Base de Datos en Railway
1. Ingresa a tu dashboard de [Railway](https://railway.app/).
2. Crea un nuevo proyecto y selecciona **+ New** > **Database** > **Add PostgreSQL**.
3. Railway aprovisionará la base de datos y generará la variable de entorno `DATABASE_URL`.

> ✅ No necesitas correr ningún comando manual para crear las tablas: al arrancar, el contenedor de `api` ejecuta automáticamente `prisma migrate deploy` contra el `DATABASE_URL` que le pases, aplicando el historial de [`packages/database/prisma/migrations`](packages/database/prisma/migrations). Esto fue probado explícitamente contra una base de datos Postgres recién creada (vacía).

### Paso 2: Desplegar el Backend (NestJS API)
1. En el mismo proyecto, haz clic en **+ New** > **GitHub Repo** > Selecciona este repositorio.
2. Ingresa a la configuración del servicio (**Settings**):
   - **Service Name**: `api`
   - **Root Directory**: `/` *(debe ser la raíz para permitir el contexto de Turbo Prune)*
   - **Dockerfile Path**: `apps/api/Dockerfile`
3. En la pestaña **Variables**:
   - `DATABASE_URL`: Vincula la variable de PostgreSQL (`${{Postgres.DATABASE_URL}}`).
   - `PORT`: `4000`
   - `NODE_ENV`: `production`
4. En **Networking**, haz clic en **Generate Domain** para obtener tu URL pública (ej. `https://api-production-xxxx.up.railway.app`).

### Paso 3: Desplegar el Frontend (Next.js Web)
1. Haz clic en **+ New** > **GitHub Repo** > Selecciona nuevamente este repositorio.
2. Ingresa a la configuración del servicio (**Settings**):
   - **Service Name**: `web`
   - **Root Directory**: `/`
   - **Dockerfile Path**: `apps/web/Dockerfile`
3. En la pestaña **Variables**:
   - `NEXT_PUBLIC_API_URL`: Coloca la URL generada para la API (ej. `https://api-production-xxxx.up.railway.app`).
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
4. En **Networking**, haz clic en **Generate Domain** para obtener el dominio público de tu aplicación web.

---

## 📋 Tabla de Scripts y Comandos

Todos los comandos pueden ejecutarse desde la raíz del proyecto con `bun run <script>`:

| Script | Acción |
| :--- | :--- |
| `bun run dev` | Inicia todos los servicios en modo desarrollo (`apps/api`, `apps/web`, `packages/database`) |
| `bun run build` | Compila todos los paquetes y aplicaciones con optimización de caché de Turborepo |
| `bun run lint` | Ejecuta ESLint en todas las aplicaciones y paquetes |
| `bun run check-types` | Valida el tipado TypeScript en todo el monorepo sin emitir archivos |
| `bun run db:generate` | Genera los tipos y cliente de Prisma |
| `bun run db:migrate` | Crea y aplica una nueva migración a partir de cambios en `schema.prisma` (uso normal en desarrollo) |
| `bun run db:deploy` | Aplica migraciones pendientes sin crear una nueva (se ejecuta automáticamente al iniciar el contenedor de `api`) |
| `bun run db:push` | Sincroniza `schema.prisma` directamente sin crear migración — solo para prototipado rápido, no mezclar con `db:migrate` |
| `bun run db:studio` | Inicia la interfaz web de Prisma Studio |
| `bun run docker:up` | Inicia todos los contenedores definidos en `docker-compose.yml` |
| `bun run docker:down` | Detiene y remueve los contenedores activos |
| `bun run docker:logs` | Sigue los logs de todos los contenedores en vivo |

---

## 🔧 Resolución de Problemas Frecuentes

### 1. Error `address already in use :::3000` o `0.0.0.0:4000`
Ocurre si quedó un proceso previo escuchando en los puertos `3000` o `4000`.
- **Solución:**
  ```bash
  # Ver procesos en los puertos
  lsof -i :3000 -i :4000
  # Matar el proceso por PID
  kill -9 <PID>
  ```

### 2. Error `Environment variable not found: DATABASE_URL`
Ocurre si no se ha creado el archivo `.env` en la raíz o la base de datos en Docker no está arriba.
- **Solución:**
  ```bash
  cp .env.example .env
  docker compose up -d postgres
  bun run db:push
  ```

### 3. Cambios en modelos de base de datos no se reflejan en TypeScript
- **Solución:**
  ```bash
  bun run db:generate
  bun run --filter=@repo/database build
  ```

---

<div align="center">
  <sub>Desarrollado con ❤️ para <strong>Aqui Canta Bolivia</strong>.</sub>
</div>

## Prueba local con Docker (sin configurar nada)

```bash
git clone <repo> && cd Senapi-AquiCanta
docker compose up -d --build     # postgres + api + web + adminer
docker compose exec api sh -c "cd /app && bun packages/database/prisma/seed-dev-inscritos.ts"   # opcional: 24 inscritos de prueba
```

- Web: http://localhost:3000 — API/Swagger: http://localhost:4000/docs — Adminer: http://localhost:8080
- Admin por defecto: `admin@aquicantabolivia.com` / `AquiCanta2026!` (migraciones y admin se crean solos al arrancar).
- Sin credenciales de Cloudinary las fotos se guardan en disco local. El login con Google requiere un OAuth client propio en `.env` (ver `.env.example`).
