# FisioCom Frontend - Vue 3

Interfaz moderna para gestión de citas de fisioterapia. Calendario interactivo tipo Google Calendar con CRUD completo.

## 🎨 Características

- ✅ Calendario interactivo estilo Google Calendar
- ✅ CRUD completo de citas (Crear, Leer, Actualizar, Eliminar)
- ✅ Validación de disponibilidad en tiempo real
- ✅ Interfaz responsive (Desktop, Tablet, Mobile)
- ✅ Notificaciones de éxito/error
- ✅ Auto-refresh cada 30 segundos
- ✅ Diseño moderno con gradientes y transiciones

## 🚀 Tech Stack

- **Vue 3** - Framework progresivo
- **Vite** - Build tool moderno
- **Axios** - Cliente HTTP
- **CSS3** - Estilos sin frameworks CSS

## 📋 Requisitos

- Node.js >= 18.0.0
- npm o yarn
- Backend FisioCom corriendo en `http://localhost:3000`

## 🔧 Instalación

### 1. Clonar y configurar

```bash
cd FisioCom-front
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Desarrollo

```bash
npm run dev
```

Accede a `http://localhost:5173`

### 4. Producción

```bash
npm run build
npm run preview
```

## 📚 Estructura del Proyecto

```
FisioCom-front/
├── src/
│   ├── App.vue                    # Componente raíz
│   ├── main.js                    # Punto de entrada
│   ├── api/
│   │   └── appointments.js        # Cliente API
│   ├── components/
│   │   ├── Calendar.vue           # Calendario interactivo
│   │   └── AppointmentForm.vue    # Formulario CRUD
│   └── styles/
│       └── main.css               # Estilos globales
├── public/
│   └── index.html                 # HTML principal
├── vite.config.js                 # Configuración Vite
├── package.json
├── .env.example
└── README.md
```

## 🖼️ Componentes

### App.vue
Componente principal que:
- Gestiona estado global de citas
- Coordina comunicación entre componentes
- Maneja notificaciones
- Auto-refresh cada 30 segundos

### Calendar.vue
Calendario interactivo que:
- Muestra mes actual con navegación
- Resalta días con citas disponibles
- Permite seleccionar día
- Lista citas del día seleccionado
- Indicadores visuales para estados

### AppointmentForm.vue
Formulario para:
- Crear nuevas citas
- Editar citas existentes
- Eliminar citas
- Validar disponibilidad por hora
- Seleccionar servicio y estado

## 🔌 API Integration

El cliente API (`src/api/appointments.js`) proporciona:

```javascript
// Obtener todas las citas
getAllAppointments()

// Obtener cita por ID
getAppointmentById(id)

// Obtener citas por rango de fechas
getAppointmentsByDateRange(startDate, endDate)

// Obtener horarios disponibles
getAvailableSlots(date)

// Crear cita
createAppointment(appointmentData)

// Actualizar cita
updateAppointment(id, appointmentData)

// Eliminar cita
deleteAppointment(id)
```

## 🎯 Flujo de Uso

1. **Visualizar calendario** - Se carga el mes actual
2. **Seleccionar día** - Click en un día muestra citas disponibles
3. **Crear cita** - Completa el formulario con:
   - Teléfono del cliente
   - Fecha y hora (validada automáticamente)
   - Tipo de servicio
   - Notas opcionales

4. **Editar cita** - Haz click en una cita para editarla
5. **Eliminar cita** - Botón "Eliminar" en el formulario

## 🎨 Personalización

### Cambiar colores

Edita `src/styles/main.css` y `src/App.vue`:

```css
--primary-color: #667eea;
--secondary-color: #764ba2;
--success-color: #28a745;
--danger-color: #dc3545;
```

### Cambiar horario de disponibilidad

Edita en backend `src/db.js` la función `getAvailableSlots`:

```javascript
const start = new Date(`${date}T09:00:00`); // Hora inicio
const end = new Date(`${date}T20:00:00`);   // Hora fin
```

### Agregar más servicios

En `AppointmentForm.vue`:

```javascript
<option value="nuevo_servicio">Nuevo Servicio</option>
```

## 🔄 Sincronización con Backend

El componente `App.vue` actualiza las citas:
- Al cargar la página
- Al guardar una cita
- Al eliminar una cita
- Cada 30 segundos (auto-refresh)

## 📱 Responsive Design

- **Desktop**: Calendario a la izquierda, formulario a la derecha
- **Tablet**: Grid de 1 columna con scroll
- **Mobile**: Stack vertical optimizado para touch

## 🚀 Performance

- **Lazy loading** de componentes
- **Validación en cliente** para reducir requests
- **Caché de API** mediante Axios
- **CSS optimizado** sin frameworks pesados

## 🧪 Testing

Abre las DevTools del navegador:

1. Abre la pestaña **Network** en DevTools
2. Interactúa con el formulario
3. Verifica los requests a `/api/appointments`

```javascript
// En consola, prueba el API:
import { getAllAppointments } from './src/api/appointments.js'
const citas = await getAllAppointments()
console.log(citas)
```

## 🐛 Troubleshooting

### "Cannot reach API"
- Verifica que el backend está corriendo: `http://localhost:3000`
- Verifica VITE_API_URL en `.env`
- Abre DevTools → Network → observa requests

### "No horarios disponibles"
- Verifica que existen slots en el backend
- Comprueba que la fecha es válida
- Revisa logs del backend

### Estilos no se cargan
- Limpia caché: `npm run build && npm run preview`
- Reinicia dev server: `npm run dev`

## 📚 Scripts

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build de producción
npm run lint     # Validar código (si está configurado)
```

## 🔐 Variables de Entorno

```env
# URL del backend
VITE_API_URL=http://localhost:3000

# (Opcional) Token de autenticación si lo agregas
# VITE_API_TOKEN=tu_token
```

## 📝 Notas de Desarrollo

- No necesita autenticación (agrégala en el futuro si es necesario)
- Los datos se sincronizen con el backend
- Los cambios se reflejan en tiempo real
- Las notificaciones desaparecen automáticamente

## 🚀 Deploy

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm run build
# Dragg and drop la carpeta 'dist'
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "preview"]
```

```bash
docker build -t fisiocom-front .
docker run -p 5173:5173 fisiocom-front
```

## 📞 Soporte

Para problemas o preguntas, consulta:
- [Backend README](../FisioCom/README.md)
- [Vue 3 Docs](https://vuejs.org)
- [Vite Docs](https://vitejs.dev)

## 📄 Licencia

ISC
