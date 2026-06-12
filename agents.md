# MathNova - Guía de Desarrollo para Agentes de IA (`agents.md`)

Bienvenido al repositorio de **MathNova**, una plataforma de aprendizaje interactivo de matemáticas dirigida a alumnos de escuela secundaria (grados 7º a 9º o 1º a 3º de secundaria). 

Este documento sirve como manual de referencia y reglas para que los agentes de IA (como tú) entiendan el contexto, la arquitectura, el estilo de código y las directrices del proyecto.

---

## 1. Información General del Proyecto
- **Propósito**: Facilitar la enseñanza y el aprendizaje dinámico de conceptos matemáticos de secundaria (álgebra, geometría, aritmética, estadística) a través de retos interactivos, lecciones gamificadas y evaluaciones.
- **Enfoque Principal**: Accesibilidad y resiliencia de conexión. El sistema debe poder ejecutarse sin conexión a internet en escuelas locales usando una base de datos local y sincronizarse cuando haya internet.

---

## 2. Stack Tecnológico
- **Frontend**: 
  - **React** (inicializado con **Vite**).
  - **TypeScript** para un desarrollo seguro y estructurado.
  - **CSS Vanilla (Módulos o CSS Estándar)** enfocado en estética premium: colores HSL armoniosos, bordes suaves, sombras realistas (glassmorphism), y micro-animaciones dinámicas.
- **Backend**:
  - **Node.js** + **Express**.
  - **TypeScript** compilado/ejecutado con `ts-node-dev` o `tsx`.
- **Bases de Datos**:
  - **Remota / En Línea**: PostgreSQL.
  - **Local / Sin Conexión**: MySQL.
  - **ORM / Adaptador**: **Sequelize** configurado de manera dinámica para alternar entre dialectos `postgres` y `mysql` mediante variables de entorno en el `.env`.

---

## 3. Estructura de Directorios

El repositorio se divide en dos componentes principales:

```
MathNova/
├── client/                 # Frontend React (Vite + TS)
│   ├── src/
│   │   ├── components/     # Componentes visuales UI (Buttons, Cards, Modals)
│   │   ├── pages/          # Vistas (Home, Dashboard, Lesson, Quiz)
│   │   ├── hooks/          # Hooks de React (ej. useAuth, useOfflineStatus)
│   │   ├── services/       # Comunicación con API y lógica de sincronización local
│   │   ├── context/        # Estado global (Autenticación, Ajustes)
│   │   ├── styles/         # Tokens de diseño, variables HSL, temas
│   │   └── App.tsx         # Componente raíz de React
├── server/                 # Backend Node.js (Express + TS)
│   ├── src/
│   │   ├── config/         # Configuración de base de datos dinámica e inicializadores
│   │   ├── controllers/    # Controladores de endpoints
│   │   ├── middleware/     # Control de acceso (JWT), validación y errores
│   │   ├── models/         # Modelos de Sequelize unificados
│   │   ├── routes/         # Definición de rutas Express
│   │   ├── services/       # Lógica compleja, como el servicio de Sincronización
│   │   └── index.ts        # Inicializador del servidor Express
├── designs/                # Carpeta para Wireframes, Mockups y capturas de pantalla
└── agents.md               # Este documento de directrices para IAs
```

---

## 4. Directrices de Base de Datos y Sincronización

### Adaptador de Base de Datos
Se utiliza Sequelize. El archivo `server/src/config/database.ts` define la instancia de Sequelize. Carga la configuración del dialecto basándose en variables de entorno:
- `DB_DIALECT=postgres` para el entorno de producción/en línea.
- `DB_DIALECT=mysql` para despliegues locales sin internet.

### Esquema Unificado
Los modelos en `server/src/models/` deben declararse de forma compatible con ambos motores. Evita utilizar tipos de datos específicos de PostgreSQL o MySQL que no se traduzcan bien en el otro dialecto.
- Usa `DataTypes.TEXT` en lugar de especificidades de JSON si necesitas almacenar objetos estructurados si el motor MySQL local es de versión antigua, o bien valida la compatibilidad con tipos `JSON` en Sequelize.

### Mecanismo de Sincronización (Sync)
El backend cuenta con endpoints bajo `/api/sync/` diseñados para:
1. Detectar transacciones realizadas de manera offline (usando marcas de tiempo `updatedAt` y logs de eventos de mutación local).
2. Empujar cambios acumulados locales hacia la base de datos de PostgreSQL en la nube cuando la conexión a internet sea restablecida.
3. Resolver conflictos de datos priorizando los datos con marcas de tiempo más recientes, o mediante reglas específicas de negocio del estudiante.

---

## 5. Directrices de Estética y UI (Frontend)
- **Diseño Premium**: El sistema debe encantar visualmente. Usa fuentes modernas (como *Inter*, *Outfit* o *Roboto* de Google Fonts).
- **Esquema de Colores**: Evita colores primarios puros. Usa HSL. Colores recomendados:
  - Primario (Matemáticas/Foco): Azul índigo o Púrpura brillante.
  - Secundario: Menta/Verde vibrante para respuestas correctas y progreso.
  - Alertas: Naranjas o Rojos suaves.
  - Fondos: Oscuros elegantes o claros minimalistas con contraste suave.
- **Interactividad**: Los botones y elementos clicables deben tener transiciones de `transform` y `box-shadow` en hover/active.

---

## 6. Convenciones de Código
- **Lenguaje**: TypeScript obligatorio. Define siempre interfaces/types para las propiedades (Props) de componentes y las respuestas de la API.
- **Nombres de Archivos**:
  - Componentes React: PascalCase (ej. `MathCard.tsx`).
  - Hooks, Helpers y Archivos Backend: camelCase (ej. `useAuth.ts`, `database.ts`).
- **Imports**: Agrupa imports de terceros arriba, seguidos de imports relativos del proyecto.
- **Comentarios**: Mantén los comentarios claros y descriptivos, especialmente en la lógica del backend encargada de la sincronización offline.
