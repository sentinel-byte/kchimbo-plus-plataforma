# Kchimbo+ | Plataforma Educativa Premium

Kchimbo+ es una plataforma web educativa ("aula virtual") con una landing page de alto impacto visual, escena 3D interactiva y un área privada para estudiantes y administradores con seguimiento de lecciones mediante una línea de tiempo dinámica y responsiva.

---

## 🚀 Stack Tecnológico

- **Frontend / Backend**: Next.js 14 (App Router) + TypeScript.
- **Estilos**: Tailwind CSS v3.4 (con soporte de Modo Oscuro integrado y tokens de diseño personalizados).
- **Escena 3D**: React Three Fiber (R3F) + Drei + Three.js.
- **Animaciones**: Framer Motion (para microinteracciones y transiciones fluidas).
- **Base de Datos**: Google Sheets API (a través de cuenta de servicio) + Capa inteligente de caché en memoria de 5 minutos.
- **Autenticación**: JSON Web Tokens (JWT) guardados en cookies `httpOnly` seguras + Hasheo de contraseñas con `bcryptjs`.
- **Seguridad**: Rate limiting en login por IP + Middleware de protección de rutas.

---

## 🛠️ Instalación y Configuración

### 1. Clonar y Configurar Dependencias
Entra en el directorio del proyecto y corre:
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto y define las siguientes variables:
```env
# Clave secreta para la firma de JWT de sesión
JWT_SECRET=tu_jwt_secreto_super_seguro_aqui

# Credenciales de Google Sheets API
GOOGLE_SHEETS_ID=tu_spreadsheet_id_de_google_sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu_correo_de_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```
> 💡 **Nota Importante:** Si no configuras las variables de Google Sheets, el proyecto activará de forma automática un **MockDatabase en memoria**. Esto te permitirá probar el flujo de Login, Dashboard, Cursos, Lecciones, Marcado de Progreso y Panel de Administración inmediatamente "out-of-the-box".

### 3. Ejecutar en Desarrollo
Corre el servidor de desarrollo:
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000) para ver la aplicación en tiempo real.

---

## 📊 Estructura de Google Sheets Requerida

Para conectar tu hoja de Google Sheets real, crea una planilla de cálculo en tu Google Drive y añade las siguientes cuatro pestañas con sus columnas exactas:

### 1. Pestaña `Usuarios`
Columnas (Fila 1):
`id`, `nombre`, `correo`, `password_hash`, `rol`, `plan`, `fecha_registro`, `cursos_inscritos`

*Ejemplo de Fila:*
- `u_1` | `Carlos Estudiante` | `estudiante@kchimbo.com` | `$2a$10$3e4cQy5oQ09oMvHpxs2v9.wP7.4Y1iTee.V6.jP/bZ.C7HwHjUo3q` (Hash bcrypt para `123456`) | `estudiante` | `premium` | `2026-07-10T12:00:00Z` | `1,2`

### 2. Pestaña `Cursos`
Columnas (Fila 1):
`id_curso`, `slug`, `titulo`, `descripcion`, `categoria`, `thumbnail_url`, `nivel`, `gratis`

*Ejemplo de Fila:*
- `1` | `diseno-ux-ui` | `Introducción al Diseño UX/UI` | `Aprende los fundamentos de la experiencia de usuario.` | `Diseño UX` | `https://images.unsplash.com/photo-1561070791-26c113006238` | `Básico` | `TRUE`

### 3. Pestaña `Temas`
Columnas (Fila 1):
`id_tema`, `id_curso`, `slug`, `orden`, `titulo`, `video_url`, `duracion`, `material_url`

*Ejemplo de Fila:*
- `1_1` | `1` | `que-es-ux-ui` | `1` | `Conceptos Básicos: ¿Qué es UX y UI?` | `https://www.youtube.com/embed/dQw4w9WgXcQ` | `12 min` | `https://figma.com`

### 4. Pestaña `Progreso`
Columnas (Fila 1):
`id_progreso`, `id_usuario`, `id_curso`, `id_tema`, `completado`, `fecha_completado`

---

## 🔑 Credenciales de Prueba (Mock / Sheets Inicial)

Puedes iniciar sesión con los siguientes usuarios de demostración precargados:

| Rol | Correo | Contraseña |
|---|---|---|
| **Estudiante** | `estudiante@kchimbo.com` | `123456` |
| **Administrador** | `admin@kchimbo.com` | `admin123` |

---

## ⚙️ Configuración de Google Service Account

1. Dirígete a la [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto nuevo.
3. Ve a **API y Servicios** > **Biblioteca**, busca **Google Sheets API** y haz clic en **Habilitar**.
4. Ve a **API y Servicios** > **Credenciales**.
5. Haz clic en **Crear credenciales** y selecciona **Cuenta de servicio** (Service Account).
6. Rellena los datos básicos y crea la cuenta.
7. En la lista de cuentas de servicio, haz clic en la que acabas de crear, ve a la pestaña **Claves** (Keys), haz clic en **Agregar clave** > **Crear clave nueva** en formato **JSON**.
8. Guarda el archivo JSON descargado en un lugar seguro. Extrae los valores de `client_email` y `private_key` e insértalos en tu archivo `.env.local`.
9. **CRÍTICO:** Abre tu archivo de Google Sheet, haz clic en **Compartir** en la esquina superior derecha y agrega el correo de la cuenta de servicio (`client_email`) con permisos de **Editor**.
