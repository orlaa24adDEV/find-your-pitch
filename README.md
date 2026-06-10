# Find Your Pitch

Plataforma para reservas deportivas.

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, Axios
- **Backend:** Node.js, Express.js, TypeScript, JWT
- **Base de Datos:** PostgreSQL + Prisma ORM
- **DevOps:** Docker, Vercel (front), Railway (back)

## Estructura

```
find-your-pitch/
├── backend/          # API REST
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── services/
│   ├── prisma/
│   ├── public/images/   # Imágenes servidas estáticamente
│   └── docker-compose.yml
├── frontend/         # SPA React
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
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

### Variables de entorno (.env)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Clave secreta para firmar access tokens |
| `JWT_REFRESH_SECRET` | Clave secreta para firmar refresh tokens |
| `FRONTEND_URL` | Origen del frontend para CORS (ej: `http://localhost:5173`) |
| `PORT` | Puerto del servidor (default: 3000) |

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

### Endpoints de la API

#### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/refresh` | Renovar accessToken (lee cookie httpOnly) |
| POST | `/api/auth/logout` | Cerrar sesión (limpia cookie) |

#### Fields
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/fields` | Listar campos |
| GET | `/api/fields/search?q=` | Buscar campos por nombre |
| GET | `/api/fields/:id` | Detalle del campo |
| POST | `/api/fields` | Crear campo (admin) |

#### Bookings (requieren autenticación)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/bookings` | Crear reserva |
| GET | `/api/bookings/my` | Mis reservas |
| GET | `/api/bookings/field/:fieldId` | Reservas de un campo |
| DELETE | `/api/bookings/:id` | Cancelar reserva |

### Modelo de datos

- **User:** id, name, email, password (hasheada), role, age
- **Field:** id, name, description, location, sport, priceHour, imageUrl
- **Booking:** id, date, startTime, endTime, status (pending/cancelled), userId, fieldId
  - `@@unique([fieldId, date, startTime])` — evita dobles reservas

### Imágenes

Las imágenes de los campos se sirven desde `backend/public/images/`. La URL en la BD usa el formato `/images/<slug>.png`.

### Scripts disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npx prisma studio    # Visualizar BD
npx prisma db seed   # Poblar BD con datos de ejemplo
```

### Postman

Se incluye una colección de Postman en `postman_collection.json` con todas las rutas documentadas.

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

### Variables de entorno

Crea un archivo `.env.local`:

```
VITE_API_URL=http://localhost:3000/api
```

### Páginas

| Ruta | Descripción |
|---|---|
| `/` | Home con buscador y listado de campos |
| `/login` | Inicio de sesión |
| `/register` | Registro de usuario |
| `/fields/:id` | Detalle del campo y formulario de reserva |
| `/dashboard` | Historial de reservas del usuario |

### Componentes

- **Button:** Variantes primary/secondary/outline/danger, tamaños sm/md/lg, estado loading con spinner
- **Input/PasswordInput:** Campos con label, validación de errores, toggle de visibilidad en contraseñas
- **Card:** Contenedor flexible para listados
- **Navbar:** Navegación responsive con enlaces condicionales según autenticación

### Reglas de contraseña

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos un número
- Al menos un carácter especial

### Colores corporativos

| Uso | Color |
|---|---|
| Pitch (verde) | `#3B9E59` |
| Electric (azul) | `#008BE2` |
| Ink (gris) | `#6B6D6B` |
| Ink 600 (texto) | `#555555` |
| Fondo | `#F8FAFC` |
