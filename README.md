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
10. [Guía de Despliegue en Railway](#-guía-de-despliegue-en-railway)
11. [Tabla de Scripts y Comandos](#-tabla-de-scripts-y-comandos)
12. [Resolución de Problemas Frecuentes](#-resolución-de-problemas-frecuentes)

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
│   └── web/                          # 🌐 Frontend Web (Next.js 15 App Router)
│       ├── public/                   # Recursos estáticos
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css       # Estilos globales, variables y glassmorphism
│       │   │   ├── layout.tsx        # Layout raíz con metadata
│       │   │   └── page.tsx          # Dashboard interactivo con status en vivo
│       ├── Dockerfile                # Multi-stage Dockerfile con salida standalone
│       ├── next.config.mjs           # Configuración con outputFileTracingRoot
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
