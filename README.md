# Portfolio Maite Castillo

Portfolio web con las tecnologias:
  - HTML
  - JavaScript moderno 
  - Tailwind. 

# Demo local (cómo ejecutarlo)

- **Opción simple**: abre `index.html` en tu navegador.
- **Recomendado**: usa un servidor local (por ejemplo la extensión **Live Server** en Cursor/VS Code) para evitar posibles restricciones del navegador.

# Funcionalidades

# Experiencia de usuario

- Modo oscuro (Tailwind `darkMode: 'class'`)
  - Un botón (`#theme-toggle`) alterna la clase `dark` en el elemento raíz (`<html>`).
  - Los componentes usan clases `dark:*` para mantener contraste y coherencia visual.

- Tilt 3D en “Sobre mí”
  - Las tarjetas de la sección `#sobre-mi` tienen perspectiva y una inclinación 3D sutil al pasar el ratón.
  - En móvil, el “tilt” se activa con toque (toggle de clase `is-flipped`).
  - Respeta preferencias de accesibilidad con `motion-reduce:*` (reduce animaciones si el sistema lo solicita).

- Toasts (notificaciones)
  - Mensajes no intrusivos (por ejemplo al eliminar una reseña) con `aria-live="polite"` para accesibilidad.

### Recomendaciones (reseñas) con persistencia

La sección `#recomendaciones` implementa un mini-sistema CRUD en el navegador:

- Publicar reseña
  - Campos: tipo, puntuación (1–5), texto.
  - Previene duplicados exactos (texto + tipo + rating).
  - Asigna fecha de publicación en formato **DD/MM/AAAA**.

- Eliminar reseña
  - Cada tarjeta tiene un botón “Eliminar”.
  - El estado se actualiza y se guarda automáticamente.

- Marcar como “Leído”
  - Cada reseña incluye un checkbox **Leído**.
  - Se guarda dentro de cada reseña en LocalStorage (misma clave `mis_resenhas`), por lo que persiste al recargar.
  - Uso: marca/desmarca para llevar control visual de qué reseñas ya revisaste.

- Persistencia en LocalStorage
  - Las reseñas se guardan bajo una única clave (`mis_resenhas`).
  - Incluye normalización/migración: si existían reseñas antiguas (p. ej. strings), se convierten al formato actual.

- Contador de reseñas
  - Muestra el total publicado y se actualiza automáticamente al añadir/eliminar.

- Filtro
  - Un buscador filtra las reseñas por texto en tiempo real.

- Estado vacío
  - Si no hay reseñas, se muestra un mensaje amigable (“Aún no hay reseñas…”).

# Testing manual de la aplicación (documentación)

Estas pruebas están adaptadas a este proyecto (portfolio) y, en concreto, a la mini-app de **Recomendaciones (reseñas)**.

- Prueba la app con la lista vacía
  - **Pasos**: borra todas las reseñas (o limpia LocalStorage `mis_resenhas`) y recarga.
  - **Resultado esperado**: se muestra el estado vacío “Aún no hay reseñas…”, y el contador queda en 0.
  - **Resultado obtenido**: OK.

- Intenta añadir una tarea sin título
  - En este proyecto no hay “tareas”; el equivalente es **publicar una reseña sin texto**.
  - **Pasos**: deja el textarea vacío y pulsa **Publicar**.
  - **Resultado esperado**: no se publica nada (la lista y el contador no cambian).
  - **Resultado obtenido**: OK.

- Añade una tarea con un título muy largo
  - Equivalente: **publicar una reseña con texto muy largo**.
  - **Pasos**: pega un texto largo (varias líneas) y publica.
  - **Resultado esperado**: la tarjeta se renderiza correctamente, el texto hace wrap (no rompe el layout), y se guarda en LocalStorage.
  - **Resultado obtenido**: OK.

- Marca varias tareas como completadas
  - En este proyecto no hay “tareas”; el equivalente es **marcar varias reseñas como Leído**.
  - **Pasos**: crea varias reseñas y marca el checkbox **Leído** en varias tarjetas.
  - **Resultado esperado**: las reseñas quedan marcadas como leídas y, al recargar, se mantiene el estado.
  - **Resultado obtenido**: OK.

- Elimina varias tareas
  - Equivalente: **eliminar varias reseñas**.
  - **Pasos**: crea varias reseñas y pulsa **Eliminar** en varias tarjetas.
  - **Resultado esperado**: se eliminan, el contador se actualiza, y aparece un toast de confirmación.
  - **Resultado obtenido**: OK.

- Recarga la página para comprobar que los datos persisten
  - **Pasos**: publica reseñas, recarga la página.
  - **Resultado esperado**: las reseñas siguen apareciendo (persistencia en LocalStorage con la clave `mis_resenhas`).
  - **Resultado obtenido**: OK.

# Ejemplos de uso (rápidos)

# Publicar una reseña

1. Ve a **Recomendaciones**.
2. Elige **Tipo de reseña** y **Puntuación**.
3. Escribe tu recomendación y pulsa **Publicar**.
4. Verás la reseña en la lista con:
   - **tipo + estrellas**
   - **fecha** (formato `DD/MM/AAAA`)

# Filtrar reseñas

1. En el campo **“Filtrar recomendaciones”**, escribe una palabra (por ejemplo: `java`).
2. La lista se actualiza en tiempo real mostrando solo las reseñas que coinciden.

# Eliminar una reseña

1. Pulsa **Eliminar** en una tarjeta.
2. La tarjeta desaparece, el **contador** se actualiza y verás un **toast** de confirmación.

# Marcar una reseña como “Leído”

1. En una tarjeta, marca el checkbox **Leído**.
2. Recarga la página: la reseña seguirá marcada como leída (persistencia en LocalStorage).

# Modo oscuro

1. Pulsa el botón 🌓 de la cabecera.
2. La UI cambia de forma consistente (fondos, textos y badges usan `dark:*`).

# Tilt 3D en “Sobre mí”

- **Desktop**: pasa el ratón por encima de una tarjeta.
- **Móvil**: toca una tarjeta para activar/desactivar el tilt.

# Estructura del proyecto

- `index.html`: estructura de la página + Tailwind (CDN) + plantilla HTML (`<template>`) para reseñas.
- `app.js`: lógica de UI, modo oscuro, reseñas, LocalStorage, renderizado y micro-interacciones. Incluye **documentación JSDoc** en las funciones clave.

# Detalles técnicos (alto nivel)

# Renderizado eficiente de reseñas

- Se renderiza desde un `<template>` (`#resenha-template`) para mantener HTML reutilizable.
- Se usa un `DocumentFragment` para añadir tarjetas al DOM con menos reflows.
- El contador se actualiza desde el flujo de render, evitando estados inconsistentes.

# Seguridad básica

- El texto del usuario se inserta en el DOM con `textContent` (no `innerHTML`).
- Se aplica un saneado mínimo adicional (escape de `<` y `>`).

# Personalización rápida

- **Textos y secciones**: edita el contenido de `index.html`.
- **Colores/estilo**: ajusta clases Tailwind (`bg-*`, `text-*`, `dark:*`) directamente en `index.html`.
- **Tipos de reseña**:
  - Añade opciones en el `<select id="tipo-resenha">` en `index.html`.
  - Ajusta el mapeo de colores en `TIPO_CLASES` en `app.js`.


# Roadmap sugerido (mejoras futuras)

- Persistir también el estado del modo oscuro (recordar preferencia del usuario).
- Añadir tests ligeros para normalización de reseñas.
- Exportar/importar reseñas (JSON) para portabilidad.


**Proyecto**: Portfolio Maite Castillo  


