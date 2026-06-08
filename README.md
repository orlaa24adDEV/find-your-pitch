# Find Your Pitch

Plataforma para reservas deportivas.

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, Axios
- **Backend:** Node.js, Express.js, TypeScript, JWT
- **Base de Datos:** PostgreSQL + Prisma ORM
- **DevOps:** Docker, Vercel (front), Railway (back)

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
# Levantar PostgreSQL con Docker
docker compose up -d

# Ejecutar migraciones
npx prisma migrate dev

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
| `JWT_SECRET` | Clave secreta para firmar tokens |
| `PORT` | Puerto del servidor (default: 3000) |

### Endpoints de la API

#### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |

#### Fields
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/fields` | Listar campos |
| GET | `/api/fields/search?q=` | Buscar campos |
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

- **User:** id, name, email, password (hasheada), role
- **Field:** id, name, description, location, sport, priceHour, imageUrl
- **Booking:** id, date, startTime, endTime, status (pending/cancelled), userId, fieldId
  - `@@unique([fieldId, date, startTime])` — evita dobles reservas

### Scripts disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npx prisma studio    # Visualizar BD
```

## Frontend

[Pendiente de desarrollo]
