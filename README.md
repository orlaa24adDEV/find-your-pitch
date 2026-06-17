# Find Your Pitch

Plataforma para reservas deportivas.

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, Axios
- **Backend:** Node.js, Express.js, TypeScript, JWT, Nodemailer
- **Base de Datos:** PostgreSQL + Prisma ORM
- **DevOps:** Docker, Vercel (front), Railway (back), GitHub Actions (CI)
- **Testing:** Vitest + Testing Library (frontend), Jest + ts-jest + supertest (backend)

## Estructura

```
find-your-pitch/
├── backend/              # API REST
│   ├── src/
│   │   ├── __tests__/    # Tests (Jest)
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   ├── public/images/    # Imágenes estáticas
│   └── package.json
├── frontend/             # SPA React
│   └── src/
│       ├── test/         # Tests (Vitest)
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── services/
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml          # CI con GitHub Actions
└── README.md
```

## Backend

### Requisitos

- Node.js 20+
- Docker (para PostgreSQL local)
- npm

### Instalación

```bash
cd backend
npm install
```

### Base de datos

```bash
# Levantar PostgreSQL con Docker (puerto 5433)
docker compose up -d

# Ejecutar migraciones
npx prisma migrate dev

# Poblar con 20 campos de Málaga
npx prisma db seed

# (Opcional) Abrir Prisma Studio para ver datos
npx prisma studio
```

### Ejecutar servidor

```bash
npm run dev
# Servidor en http://localhost:3000
```

### Testing

```bash
# Backend
npm test

# Frontend
cd frontend && npm test
```

### Variables de entorno (.env)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Clave secreta para firmar access tokens |
| `JWT_REFRESH_SECRET` | Clave secreta para firmar refresh tokens |
| `FRONTEND_URL` | Origen del frontend para CORS (ej: `http://localhost:5173`) |
| `PORT` | Puerto del servidor (default: 3000) |
| `SMTP_HOST` | Servidor SMTP para emails (opcional, default Ethereal) |
| `SMTP_PORT` | Puerto SMTP |
| `SMTP_SECURE` | TLS (true/false) |
| `SMTP_USER` | Usuario SMTP |
| `SMTP_PASS` | Contraseña SMTP |
| `SMTP_FROM` | Dirección remitente |
| `ADMIN_KEY` | Clave secreta para registrarse como admin en `POST /auth/register` |
| `NODE_ENV` | `development` o `production` |

### Autenticación

La API usa **doble token JWT** para seguridad:

- **accessToken** (15 min de validez) — se envía en cada petición protegida via `Authorization: Bearer <token>`. Se almacena solo en memoria (React state), nunca en localStorage.
- **refreshToken** (7 días de validez) — se almacena en una **cookie httpOnly** con ruta `/api/auth`. Es invisible para JavaScript, lo que lo protege de ataques XSS.

**Flujo:**
1. Login/Register → backend devuelve `accessToken` en el body + `refreshToken` en cookie httpOnly
2. Frontend guarda `accessToken` en memoria y lo adjunta en cada petición
3. Si el `accessToken` expira (401), el interceptor de Axios llama automáticamente a `POST /auth/refresh`
4. El backend lee el `refreshToken` de la cookie, valida, y devuelve un nuevo `accessToken`
5. Si el refresh falla, se fuerza el logout del usuario

**Rate limiting por endpoint** (express-rate-limit):

| Ruta | Límite | Ventana |
|---|---|---|
| `/auth/register` | 10 peticiones | 15 min |
| `/auth/login` | 10 peticiones | 15 min |
| `/auth/refresh` | 20 peticiones | 15 min |
| `/auth/forgot-password` | 3 peticiones | 15 min |
| `/auth/reset-password` | 5 peticiones | 15 min |

### Endpoints de la API

#### Auth
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | — | Registrar usuario |
| POST | `/api/auth/login` | — | Iniciar sesión |
| POST | `/api/auth/refresh` | Cookie | Renovar accessToken |
| POST | `/api/auth/logout` | — | Cerrar sesión |
| GET | `/api/auth/me` | Bearer | Obtener perfil |
| PUT | `/api/auth/me` | Bearer | Actualizar perfil (name, email, age) |
| PUT | `/api/auth/me/password` | Bearer | Cambiar contraseña |
| POST | `/api/auth/me/avatar` | Bearer | Subir foto de perfil (multipart, max 5MB, se comprime a WebP) |
| POST | `/api/auth/forgot-password` | — | Solicitar restablecimiento de contraseña |
| POST | `/api/auth/reset-password` | — | Restablecer contraseña con token |
| POST | `/api/auth/promote/:id` | Admin | Promover usuario a admin |
| POST | `/api/auth/register` (con `adminKey`) | — | Registrarse como admin si `adminKey` coincide con `ADMIN_KEY` del entorno |

#### Fields
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/fields` | Opt | Listar campos (filtros: `?sport=&minPrice=&maxPrice=`) |
| GET | `/api/fields/sports` | — | Deportes disponibles |
| GET | `/api/fields/search?q=` | Opt | Buscar campos por texto + filtros |
| GET | `/api/fields/:id` | Opt | Detalle del campo |
| GET | `/api/fields/:id/availability?date=` | — | Slots reservados en una fecha |
| POST | `/api/fields` | Admin | Crear campo |
| PUT | `/api/fields/:id` | Admin | Actualizar campo |
| DELETE | `/api/fields/:id` | Admin | Eliminar campo |
| POST | `/api/fields/:id/image` | Admin | Subir imagen (multipart, max 5MB) |

#### Bookings (requieren autenticación)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/bookings` | Bearer | Crear reserva |
| GET | `/api/bookings/my?page=&limit=` | Bearer | Mis reservas (paginated) |
| GET | `/api/bookings/unpaid` | Bearer | Reservas sin pagar |
| GET | `/api/bookings/:id` | Bearer | Detalle de reserva |
| GET | `/api/bookings/field/:fieldId` | Bearer | Reservas de un campo |
| GET | `/api/bookings/all?page=&limit=` | Admin | Todas las reservas |
| DELETE | `/api/bookings/:id` | Bearer | Cancelar reserva |
| POST | `/api/bookings/:id/pay` | Bearer | Pagar reserva (simulado, 2s) |

#### Users (requieren autenticación + admin)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/users?page=&limit=&search=` | Admin | Listar usuarios (búsqueda por nombre/email) |
| GET | `/api/users/:id` | Admin | Detalle de usuario con sus reservas |
| GET | `/api/users/:id/bookings?page=&limit=` | Admin | Reservas de un usuario específico |
| DELETE | `/api/users/:id` | Admin | Eliminar usuario (con sus reservas) |
| PUT | `/api/users/:id/role` | Admin | Cambiar rol (`user` ↔ `admin`) |

#### Favorites (requieren autenticación)
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/favorites/:fieldId` | Bearer | Añadir/quitar favorito (toggle) |
| GET | `/api/favorites?page=&limit=` | Bearer | Listar favoritos (paginated) |

### Modelo de datos

```
User
  id, name, email, password (bcrypt), role ("user"|"admin"), age?, avatarUrl?
  relations: Booking[], Favorite[], PasswordResetToken[]

PasswordResetToken
  id, email, token (SHA-256), expiresAt, createdAt
  relation: User
  index: token

Field
  id, name, description, location, sport, priceHour, imageUrl?, lat?, lng?
  relations: Booking[], Favorite[]

Favorite
  id, userId, fieldId, createdAt
  @@unique([userId, fieldId])

Booking
  id, date (DateTime), startTime (HH:MM), endTime (HH:MM), status ("unpaid"|"confirmed"|"cancelled")
  userId, fieldId
  @@unique([fieldId, date, startTime]) — evita dobles reservas
```

### Flujo de pago

1. Usuario crea reserva → status `unpaid`
2. Usuario paga → simulación 2s → status `confirmed`
3. Usuario cancela → status `cancelled` (se elimina automáticamente tras 5 min)

### Imágenes

- **Imágenes semilla** (20 campos de Málaga): `backend/public/images/*.webp` — vienen en la imagen Docker, siempre disponibles
- **Imágenes subidas** (avatares, imágenes de campo): `backend/data/images/` via `express.static("data")` — se almacenan en Railway Volume para persistencia entre redeploys
- **Campos:** `data/images/fields/` — subida por admin (multipart, max 5MB)
- **Avatares:** `data/images/avatars/` — subida por usuario (multipart, max 5MB)
- Los avatares se comprimen automáticamente con Sharp (WebP 500×500, calidad 80), el original se elimina
- Las carpetas `data/images/{avatars,fields}` se crean al iniciar el servidor (`mkdir -p` en server.ts)
- `data/` está excluido de la imagen Docker (`.dockerignore`) para que el Railway Volume monte limpio

### Scripts disponibles

```bash
npm run dev          # Desarrollo con hot-reload (tsx)
npm run build        # Compilar TypeScript a dist/
npm start            # Producción (desde dist/)
npm test             # Tests con Jest
npx prisma studio    # Visualizar BD
npx prisma db seed   # Poblar BD con datos de ejemplo
npx prisma migrate dev  # Ejecutar migraciones
```

### Postman

Se incluye una colección de Postman en `postman_collection.json`.

## Frontend

### Instalación

```bash
cd frontend
npm install
```

### Ejecutar

```bash
npm run dev
# Servidor en http://localhost:5173
```

### Testing

```bash
npm test
npm test -- --run   # Una sola ejecución (sin watch)
```

### Variables de entorno

`.env.local`:

```
VITE_API_URL=http://localhost:3000/api
```

### Páginas

| Ruta | Descripción |
|---|---|
| `/` | Home con buscador, filtros laterales y listado de campos |
| `/login` | Inicio de sesión |
| `/register` | Registro de usuario |
| `/forgot-password` | Restablecer contraseña (paso 1: email) |
| `/reset-password?token=` | Restablecer contraseña (paso 2: nueva contraseña) |
| `/fields/:id` | Detalle del campo, disponibilidad y formulario de reserva |
| `/payment/:id` | Pasarela de pago simulada (tarjeta/PayPal/Apple Pay) |
| `/dashboard` | Historial de reservas y favoritos |
| `/profile` | Editar perfil, cambiar contraseña, subir avatar con recorte |
| `/admin` | Panel admin: CRUD de campos + listado de reservas + gestión de usuarios (buscar, cambiar rol, eliminar, ver reservas) |
| `*` | Página 404 |

### Componentes principales

- **Button:** Variantes primary/outline/danger, tamaños sm/md/lg, estado loading con spinner
- **Input/PasswordInput:** Campos con label, validación de errores, toggle de visibilidad (`useId()` para accesibilidad)
- **Card:** Contenedor flexible con sombra y hover
- **Navbar:** Responsive con hamburger menu en móvil (avatar con submenú anidado dentro del menú), avatar dropdown en desktop con perfil, navegación y logout
- **DatePicker:** Calendario personalizado con portal, posicionamiento automático arriba/abajo
- **TimePicker:** Selector de horas con slots de 30 min, filtro por `minTime` y `disabledRanges` (slots ocupados)
- **Pagination:** Navegación con páginas, elipsis, botones anterior/siguiente
- **ConfirmModal:** Diálogo de confirmación reutilizable con overlay y loading
- **AvatarCropModal:** Recorte de avatar con react-easy-crop y canvas para generar PNG
- **MapPreview:** Mapa Leaflet con marcador y popup
- **ToastContainer:** Notificaciones toast con auto-dismiss, tipos success/error/info

### Hooks

- **`useAuth()`**: Contexto de autenticación (login, logout, user, accessToken, updateUser)
- **`useFields()`**: Listado paginado + búsqueda + filtros (sport, minPrice, maxPrice)
- **`useBookings()`**: Reservas del usuario paginadas + cancelación optimista
- **`useFavorites()`**: Favoritos con toggle optimista + listado paginado

### Reglas de contraseña

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos un número
- Al menos un carácter especial

### Colores corporativos

| Uso | Color | Tailwind |
|---|---|---|
| Pitch (verde) | `#3B9E59` | `pitch` |
| Electric (azul) | `#008BE2` | `electric` |
| Ink (gris) | `#6B6D6B` | `ink` |
| Ink 600 (texto) | `#555555` | `ink-600` |
| Fondo | `#F8FAFC` | `bg-slate-50` |

## CI/CD

El proyecto usa **GitHub Actions** para integración continua. En cada push a `main` se ejecuta el workflow `.github/workflows/ci.yml` que corre en paralelo:

| Job | Servicio | Comandos |
|---|---|---|
| `backend` | PostgreSQL 16 (contenedor), Node 22 | `npm ci` → `prisma migrate deploy` → `npm test` |
| `frontend` | Node 22 | `npm install` → `npm test` |

Los resultados se ven en GitHub → pestaña Actions. Railway y Vercel despliegan automáticamente al detectar cambios en `main`.

## Funcionalidades destacadas

### Filtros en Home
Panel lateral colapsable con filtros por deporte (select poblado desde la API) y rango de precio. Los filtros se combinan con la búsqueda por texto y se reflejan en la paginación.

### Disponibilidad en tiempo real
Al seleccionar una fecha en el detalle del campo, se consultan los slots ocupados y se ocultan automáticamente del selector de hora. Muestra un resumen visual (slots libres / reservados).

### Subida de avatar con compresión
El usuario selecciona y recorta su foto con react-easy-crop. Se envía al backend como PNG, donde Sharp lo redimensiona a 500×500 y lo convierte a WebP (calidad 80). El archivo original se elimina.

### Panel de Administración
Tres tabs: **Campos** (CRUD completo con subida de imagen), **Reservas** (todas las reservas del sistema con datos del usuario), **Usuarios** (lista paginada con búsqueda, cambio de rol, eliminación y modal de reservas por usuario).

### Recuperación de contraseña
Flujo completo: el usuario introduce su email → backend genera un token SHA-256 con expiración de 1h → en desarrollo se muestra la URL en pantalla; en producción se envía por email (Nodemailer con Ethereal por defecto, configurable con SMTP real).

### Seguridad
- Helmet con CSP (OSM tiles en img-src, FRONTEND_URL en connect-src)
- Refresh tokens en cookie httpOnly con path `/api/auth`
- Rate limiting por endpoint
- Zod validation en todas las entradas
- Multer con límites de tamaño y filtro de extensiones
- **ADMIN_KEY**: registro seguro de administradores. Sin la clave, el rol siempre es `"user"`
- **clearCookie** con mismas opciones (sameSite, secure) que la cookie original para logout efectivo
