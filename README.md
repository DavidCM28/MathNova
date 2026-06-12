# MathNova

Repositorio oficial para el desarrollo de **MathNova**, una plataforma interactiva de aprendizaje de matemáticas diseñada especialmente para estudiantes de secundaria (grados 7º a 9º). 

El proyecto cuenta con un enfoque **Offline-First**, diseñado para funcionar en servidores escolares locales (usando MySQL) y sincronizar los datos con un servidor central en la nube (usando PostgreSQL) cuando la conexión a internet esté disponible.

---

## 🚀 Stack Tecnológico

- **Frontend (Client)**: React.js (Vite) + TypeScript + CSS Moderno.
- **Backend (Server)**: Node.js + Express + TypeScript.
- **Base de Datos**: 
  - **Online**: PostgreSQL.
  - **Local/Offline**: MySQL.
  - **ORM**: Sequelize (con soporte dinámico de dialectos).

---

## 📁 Estructura del Repositorio

El repositorio se divide en dos componentes independientes y carpetas de documentación:

- **[client/](file:///c:/Users/bdavi/Documents/Escuela/Noveno/MathNova/MathNova/client)**: Aplicación frontend construida con React y Vite.
- **[server/](file:///c:/Users/bdavi/Documents/Escuela/Noveno/MathNova/MathNova/server)**: API REST backend desarrollada en Node.js y Express.
- **[designs/](file:///c:/Users/bdavi/Documents/Escuela/Noveno/MathNova/MathNova/designs)**: Directorio para diagramas, wireframes y capturas de diseño.
- **[agents.md](file:///c:/Users/bdavi/Documents/Escuela/Noveno/MathNova/MathNova/agents.md)**: Manual y directrices de desarrollo para asistentes de IA.

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado:
- **Node.js** (versión 18 o superior).
- **npm** (o yarn/pnpm).
- **Git**.
- Base de datos local (**MySQL**) o acceso a base de datos en la nube (**PostgreSQL**).

---

## 💻 Configuración Local y Ejecución

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/DavidCM28/MathNova.git
cd MathNova
```

### 2. Ejecutar el Frontend (Client)

Dirígete a la carpeta `client/` e inicia el servidor de desarrollo de Vite:

```bash
cd client
npm install
npm run dev
```

El cliente estará disponible por defecto en `http://localhost:5173`.

### 3. Ejecutar el Backend (Server)

Dirígete a la carpeta `server/`, crea un archivo de configuración de entorno, e inicia el servidor en desarrollo:

```bash
cd server
npm install

# Crea y configura tu archivo .env
# Copia el archivo .env.example si está disponible
npm run dev
```

El servidor estará escuchando en `http://localhost:5000`.

---

## 🔄 Flujo de Sincronización Offline-First

MathNova está diseñado para entornos escolares donde la conectividad a Internet es intermitente:
1. **Acción Offline**: El estudiante completa lecciones o quizzes de matemáticas. La información se guarda de manera local en el servidor de la escuela (MySQL).
2. **Registro de Cambios**: Cada mutación genera una cola de sincronización con marcas de tiempo precisas (`updatedAt`).
3. **Sincronización Activa**: Un servicio en el backend (`SyncService`) detecta cuando la conexión externa a internet se restablece y envía las transacciones de MySQL hacia PostgreSQL en la nube, resolviendo posibles conflictos de manera automatizada.

Para más detalles de las reglas de desarrollo, consulta [agents.md](file:///c:/Users/bdavi/Documents/Escuela/Noveno/MathNova/MathNova/agents.md).
