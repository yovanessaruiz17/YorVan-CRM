# 🚀 YORVAR CRM - Enterprise Commercial Suite

> **Plataforma integral de prospección B2B, pipeline de ventas Kanban, secuencias de correo multietapa, scoring inteligente, entregabilidad avanzada y analítica comercial.**

---

## 📌 ¿Qué es YORVAR CRM?

**YORVAR CRM** es una solución comercial diseñada para equipos de ventas B2B, SDRs, ejecutivos de cuentas y gerentes comerciales. Permite centralizar todo el ciclo de vida del cliente: desde la captura y calificación inicial de prospectos hasta el cierre de negocios y la auditoría de actividades.

### 🌟 Funcionalidades Principales

1. **🎯 Directorio de Prospectos (Leads) & Scoring Automático**:
   - Puntuación algorítmica de prospectos en tiempo real (Frecuencia, aperturas, clics, respuestas, completitud de datos y penalizaciones).
   - Clasificación térmica automática: *Muy Caliente (80+)*, *Caliente (60-79)*, *Tibio (35-59)* y *Frío (<35)*.
   - Importación masiva vía CSV y exportación con un clic.

2. **🏢 Sincronización Automática entre Entidades (Empresas, Contactos y Negocios)**:
   - Al registrar o importar un prospecto, el sistema valida y crea de forma inmediata la **Empresa/Cuenta** y el **Contacto Principal**.
   - Si se define un monto estimado de negocio, genera en automático la **Oportunidad en el Pipeline**, eliminando el trabajo duplicado.

3. **📊 Pipeline Comercial Kanban Interactivo**:
   - Tablero visual con 9 etapas comerciales (desde Prospección hasta Ganado/Perdido).
   - Cálculo en tiempo real de valor ponderado (*Weighted Value*) según la probabilidad de cierre de cada fase.
   - Arrastrar y soltar (*drag & drop*), filtros por responsable, búsqueda rápida y conversión directa de leads a oportunidades.

4. **✉️ Campañas & Secuencias de Email Multietapa**:
   - Creación de secuencias de seguimiento automatizadas con retrasos programados (Día 1, Día 3, Día 7).
   - Editor de plantillas enriquecido con variables dinámicas (`{{nombre}}`, `{{empresa}}`, `{{cargo}}`, `{{vendedor}}`, `{{producto}}`, etc.).
   - Centro de exclusión y lista de supresión (*Blacklist/Unsubscribe*) para cumplimiento de normativas de privacidad.

5. **🛡️ Suite de Entregabilidad & Reputación de Correo**:
   - Verificación de registros DNS criptográficos (**SPF, DKIM, DMARC y MX**) para proteger el dominio.
   - Monitoreo de reputación del dominio remitente (Score 0-100), tasa de rebote (*Bounce Rate*) y quejas de spam.
   - Modo calentamiento (*Warmup mode*) y limitadores de envío por hora y por día.

6. **⚡ Automatizaciones & Segmentos Dinámicos**:
   - Constructor de segmentos basados en filtros multicriterio (Industria, Ciudad, Nivel de Score, Estado comercial).
   - Reglas automáticas basadas en eventos (cambio de fase en pipeline, nuevo lead con score alto, recordatorios de inactividad).

7. **👥 Seguridad y Control de Acceso Basado en Roles (RBAC)**:
   - Matriz de permisos granulares con 7 perfiles preconfigurados:
     - **Super Admin**: Control total del sistema, integraciones, configuraciones y base de datos.
     - **Admin Comercial**: Gestión de pipelines, usuarios, secuencias y reportes.
     - **Gerente de Ventas**: Monitoreo de rendimiento del equipo, reasignación y metas comerciales.
     - **Vendedor / Account Executive**: Gestión de sus oportunidades, empresas asignadas y tareas.
     - **SDR / Prospección**: Calificación de leads, llamadas y secuencias de prospección en frío.
     - **Marketing**: Campañas, entregabilidad y segmentación.
     - **Soporte / Solo Lectura**: Consulta de cuentas sin permisos de modificación.
   - Selector rápido para simular y alternar entre usuarios en tiempo real.

8. **🤖 Copiloto Comercial con Inteligencia Artificial (Gemini)**:
   - Redacción de correos comerciales personalizados en frío con tono persuasivo y profesional.
   - Resúmenes ejecutivos de prospectos y detección de puntos de dolor (*Pain Points*).
   - Sugerencias del *Siguiente Mejor Paso* (*Next Best Action*) y manejo de objeciones comerciales.

9. **📜 Registro Inmutable de Auditoría (Audit Logs)**:
   - Registro con fecha, usuario, acción, entidad y valores previos/nuevos para máxima transparencia y trazabilidad.

10. **☁️ Sincronización con Base de Datos Supabase (PostgreSQL)**:
    - Almacenamiento local persistente por defecto (`localStorage`) con integración completa a **Supabase Cloud**.
    - Panel de prueba de conexión en tiempo real, generador de script SQL para tablas y sincronización bidireccional (Pull / Push).

---

## 💻 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:

- **Node.js**: Versión `18.0.0` o superior ([Descargar Node.js](https://nodejs.org/)).
- **npm** (incluido con Node.js) o gestor de paquetes alternativo (**pnpm** o **yarn**).
- Navegador web moderno (Chrome, Edge, Firefox, Safari o Brave).

---

## 🛠️ Guía de Instalación y Uso Paso a Paso

Sigue estos pasos desde que descargas el proyecto:

### Paso 1: Descargar y descomprimir el proyecto
1. Descarga el archivo ZIP del proyecto o clónalo mediante Git:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd yorvar-crm
   ```

### Paso 2: Instalar las dependencias
Abre tu terminal en la carpeta raíz del proyecto y ejecuta:
```bash
npm install
```
*Este comando descargará e instalará todas las librerías necesarias (React, Vite, Express, Lucide Icons, Recharts, Tailwind CSS, Supabase SDK, Google Gen AI SDK, etc.).*

### Paso 3: Configurar variables de entorno (Opcional)
Copia el archivo de ejemplo para crear tu `.env`:
```bash
cp .env.example .env
```
Edita el archivo `.env` si deseas activar las funciones de Inteligencia Artificial y la sincronización con Supabase desde el inicio:
```env
# Clave de Gemini API para el Copiloto Comercial
GEMINI_API_KEY=tu_api_key_aqui

# Conexión a Supabase (Opcional - también configurable desde la UI de la app)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_anon_aqui
```
*(Nota: Si no configuras las claves inmediatamente, el CRM seguirá funcionando al 100% en modo local con heurística inteligente y almacenamiento en el navegador).*

### Paso 4: Iniciar la aplicación en modo desarrollo
Ejecuta el siguiente comando en la terminal:
```bash
npm run dev
```

Verás un mensaje similar a:
```
Server running at http://localhost:3000
```

### Paso 5: Abrir la aplicación
Abre tu navegador e ingresa a:
👉 **`http://localhost:3000`**

---

## 📖 Cómo Usar YORVAR CRM (Flujo Comercial)

### 1. Panel de Inicio (Dashboard)
- Visualiza de inmediato el embudo de ventas, prospectos calientes que requieren atención urgente, valor del pipeline y próximas tareas.
- Haz clic en **AI Sales Copilot** (en la barra lateral) para solicitar asistencia en redacción de correos o análisis de cuentas.

### 2. Gestión de Prospectos (Leads)
- Ve a **Prospectos (Leads)**.
- Haz clic en **+ Nuevo Prospecto** para registrar un lead con sus datos de contacto y scoring.
- El sistema creará automáticamente la **Empresa** y el **Contacto** asociado en sus respectivas secciones.
- Si le asignas un valor comercial estimado, verás cómo se crea automáticamente en el **Pipeline de Ventas**.
- Usa el botón **Importar CSV** para cargar listas de prospectos en lote.

### 3. Pipeline de Ventas (Kanban)
- Ve a **Pipeline de Ventas**.
- Mueve las tarjetas entre columnas arrastrándolas o cambiando su fase dentro del modal de detalle.
- Filtra por vendedor responsable para revisar el avance individual de cada miembro del equipo.

### 4. Automatizaciones & Secuencias de Correo
- Ve a **Campañas & Secuencias** para programar cadencias de contacto en frío de 3 o 5 pasos.
- En **Entregabilidad**, verifica el estado de salud de tu dominio remitente y simula el cumplimiento de registros SPF/DKIM/DMARC.
- En **Seguimientos Dinámicos**, crea audiencias segmentadas para enfocar los esfuerzos del equipo en prospectos calientes o industrias específicas.

### 5. Simulación de Roles (RBAC)
- En la barra superior, haz clic en el selector de **Usuario / Rol**.
- Cambia entre *Yorleidys Navarro (Super Admin)*, *Carlos Mendoza (Vendedor)*, *Valeria Gómez (Gerente)*, etc., para observar cómo la interfaz y los permisos se adaptan automáticamente al perfil seleccionado.

### 6. Conexión a Base de Datos Supabase (Opcional)
Para sincronizar toda la información con tu base de datos en la nube:
1. Ve a **Configuración** ⚙️ y selecciona la pestaña **Base de Datos Supabase**.
2. Haz clic en **Copiar Script SQL de Tablas**.
3. Pega y ejecuta el script en el **SQL Editor** de tu panel de control de Supabase para crear las tablas (`crm_leads`, `crm_companies`, `crm_contacts`, `crm_opportunities`, etc.).
4. Ingresa la **URL de Supabase** y la **Anon Public Key**.
5. Haz clic en **Probar Conexión**.
6. Usa el botón **Sincronizar Todo (Exportar al Cloud)** para respaldar tus datos locales en PostgreSQL.

---

## 📜 Scripts del Proyecto

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor backend Express y la aplicación cliente Vite en el puerto 3000 con recarga automática. |
| `npm run build` | Genera la compilación optimizada para producción del frontend en `dist/` y empaqueta el servidor en `dist/server.cjs`. |
| `npm run start` | Inicia el servidor compilado en modo producción (`node dist/server.cjs`). |
| `npm run lint` | Ejecuta el validador estático de TypeScript (`tsc --noEmit`) para asegurar que no existan errores de tipos. |

---

## 🏗️ Estructura del Código

```text
yorvar-crm/
├── metadata.json                # Metadatos de la aplicación
├── package.json                 # Dependencias y scripts de ejecución
├── server.ts                    # Servidor backend Express con API REST y Gemini Copilot
├── index.html                   # Documento HTML principal
├── .env.example                 # Plantilla de variables de entorno
├── src/
│   ├── main.tsx                 # Entrada principal React 18
│   ├── App.tsx                  # Componente raíz con enrutamiento de vistas
│   ├── index.css                # Estilos globales con Tailwind CSS
│   ├── types/                   # Definiciones de tipos TypeScript
│   │   ├── auth.ts              # Roles RBAC, permisos y usuarios
│   │   ├── crm.ts               # Prospectos, Empresas, Contactos, Oportunidades, Tareas
│   │   ├── email.ts             # Campañas, Secuencias, Entregabilidad, Plantillas
│   │   └── automations.ts       # Reglas de automatización y configuración
│   ├── context/                 # Estado global de la aplicación
│   │   ├── AuthContext.tsx      # Gestión de autenticación, roles y permisos
│   │   └── CRMContext.tsx       # Estado y lógica comercial del CRM
│   ├── services/                # Servicios e integraciones externas
│   │   ├── geminiService.ts     # Cliente del Copiloto Comercial IA
│   │   ├── emailDeliverabilityService.ts # Cálculo de reputación y plantillas
│   │   └── supabaseService.ts   # Conexión, sincronización y generador SQL para Supabase
│   ├── data/                    # Datos iniciales y configuración por defecto
│   │   ├── mockData.ts          # Datos comerciales y usuarios de demostración
│   │   └── initialConfig.ts     # Configuración de etapas, DNS y reglas de scoring
│   └── components/              # Vistas y componentes modulares
│       ├── layout/              # Sidebar, Header, Barra de Usuario y Onboarding
│       ├── dashboard/           # Métricas, KPIs y gráficos de rendimiento
│       ├── leads/               # Directorio, formularios, importador y detalle de prospectos
│       ├── companies/           # Cuentas corporativas y resumen financiero
│       ├── contacts/            # Directorio de decisores y contactos clave
│       ├── pipeline/            # Tablero Kanban y gestión de oportunidades
│       ├── tasks/               # Tareas comerciales, llamadas y reuniones
│       ├── email/               # Campañas, secuencias y plantillas
│       ├── deliverability/      # Monitoreo de DNS SPF/DKIM/DMARC y reputación
│       ├── segments/            # Constructor de seguimientos dinámicos
│       ├── automations/         # Motor de reglas automáticas
│       ├── reports/             # Analítica de conversión y rendimiento comercial
│       ├── team/                # Directorio del equipo y asignación de roles
│       ├── audit/               # Registro inmutable de auditoría (Audit Logs)
│       ├── settings/            # Ajustes generales y conexión con Supabase
│       └── ai/                  # Asistente Copiloto Comercial flotante
```

---

## 🛡️ Licencia y Propiedad

Desarrollado para **YORVAR CRM Solutions**. Todos los derechos reservados.
