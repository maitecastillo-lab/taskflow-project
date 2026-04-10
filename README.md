# TaskFlow: Gestión de Tareas (reseñas)

**TaskFlow** es una aplicación desarrollada originalmente como un gestor de tareas, pero que
he adecuado y personalizado para funcionar como un sistema de gestión de reseñas. 
Es la pieza central de mi portfolio, donde demuestro la capacidad de adaptar requisitos 
técnicos a un caso de uso real y profesional.

## Organización del Proyecto (Ramas)

El repositorio está organizado en dos ramas:

### 1. Rama `main`
Es la base del proyecto donde se cumplieron los requisitos iniciales:
* **Interfaz**: HTML semántico y CSS puro.
* **Lógica**: JavaScript Vanilla para añadir, completar y eliminar tareas.
* **Persistencia**: Uso de `LocalStorage` para mantener los datos en el navegador.
* **Estadísticas**: Contador básico de tareas totales y completadas.

### 2. Rama `version-tailwind` 
En esta rama se realizó la mejora profesional del sistema:
* **Diseño Avanzado**: Migración total a **Tailwind CSS**, implementación de diseño **Responsive** y **Modo Oscuro**.
* **Optimización con IA**: Refactorización de funciones y mejora de lógica utilizando **Cursor, Claude y ChatGPT** .
* **Integración de Backend**: Construcción de una **API REST** con **Node.js y Express**.
* **Arquitectura Profesional**: Separación del código en capas (**Routers, Controllers y Services**) para un mantenimiento escalable.

## Tecnologías Utilizadas

* **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+), Fetch API.
* **Backend**: Node.js, Express.js, Cors, Dotenv.
* **IA & Herramientas**: Cursor IDE, Prompt Engineering, Git/GitHub, Vercel.
-

## Estructura de Carpetas (Rama Tailwind)

* `server/`: Contiene el servidor Node.js (Estructura por capas).
* `src/`: Lógica del frontend y cliente de red.
* `docs/ai/`: Reportes de comparativas de IA, prompts y reflexiones sobre el uso de herramientas inteligentes.
