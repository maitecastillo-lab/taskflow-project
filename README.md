# Portfolio Maite Castillo

Portfolio web con las tecnologias:
  - HTML
  - JavaScript moderno 
  - Tailwind. 

# COMO EJECUTARLO:

- abre `index.html` en tu navegador.

# Funcionalidades y Experiencia de usuario

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
  - tipo, puntuación (1–5), texto, categoria.
  - Previene duplicados exactos (texto + tipo + rating).
  - Asigna fecha de publicación en formato **DD/MM/AAAA**.

- Eliminar reseña
  - Cada tarjeta tiene un botón “Eliminar”.
  - El estado se actualiza y se guarda automáticamente.

- Marcar como “Leído”
  - Cada reseña incluye un checkbox **Leído**.
  - Se guarda dentro de cada reseña en LocalStorage (misma clave `mis_resenhas`), por lo que persiste al recargar.
  - Uso: marca/desmarca para llevar control visual de qué reseñas ya revisaste.


- Contador de reseñas
  - Muestra el total publicado y se actualiza automáticamente al añadir/eliminar.

- Filtro
  - Un buscador filtra las reseñas por texto en tiempo real.

- Estado vacío
  - Si no hay reseñas, se muestra un mensaje  (“Aún no hay reseñas…”).

# Testing manual de la aplicación (documentación)
- Prueba la app con la lista vacía
  - **Pasos**: borra todas las reseñas (o limpia LocalStorage `mis_resenhas`) y recarga.
  - **Resultado esperado**: se muestra el estado vacío “Aún no hay reseñas…”, y el contador queda en 0.
  - **Resultado obtenido**: todo ok.

- Intenta añadir una tarea de meos de 3 letras
  - **Pasos**: has una pubi de solo una letra "a"
  - **Resultado esperado**: sale el error que es demasiado corto
  - **Resultado obtenido**: todo ok.


- Marca varias tareas como completadas
  - **Pasos**: crea varias reseñas y marca el checkbox Leído en varias tarjetas.
  - **Resultado esperado**: las reseñas quedan marcadas como leídas y, al recargar, se mantiene el estado.
  - **Resultado obtenido**: todo ok.

# Ejemplos de uso

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
3. Puedes filtrar tambien de más antigua a más nueva

# Eliminar una reseña

1. Pulsa **Eliminar** en una tarjeta.
2. La tarjeta desaparece, el **contador** se actualiza y verás un **toast** de confirmación.

# Modo oscuro
1. Pulsa el botón 🌓 de la cabecera.
2. La UI cambia de forma consistente (fondos, textos y badges usan `dark:*`).

# Estructura del proyecto
- index.html: estructura de la página + Tailwind (CDN) + plantilla HTML (`<template>`) para reseñas.
- app.js: lógica de UI, modo oscuro, reseñas, LocalStorage, renderizado y micro-interacciones. Incluye **documentación JSDoc** en las funciones clave.
- client.js: es el mensajero que hace las peticiones (get,post,delete) usando la API.
-server: carpeta con node.js, las rutas y el lcontrolador que guarda las reseñasl, en pocas palabras lo que no se ve.

# Middlewares:
- CORS: Mecanismo de seguridad basado en cabeceras HTTP que permite a un servidor indicar cualquier dominio, esquema o puerto, distinto al suyo propio desde el cual un navegador debería permitir la carga de recursos.
  - En mi web: ya que el frontend esta en el puerto 5500 y el backend en 3000, el navegador bloquearia la comunicación por politica del mismo origen, lo que hace este middleware añade las cabeceras necesarias a la respuesta para autorizar la conexion del cliente.

- JSON: Es un middleware encargado del parseo del cuerpo de la petición. analiza las solicitudes entrantes con el encabezado.

  -en mi web: Cuando enviamos una reseña, los datos viajan como un flujo de texto plano, este middleware intercepta ese flujo, lo transforma en un objeto "req.body" javaScript legible y lo inyecta en el objeto para que el controlador pueda extrar propiedades como en mi caso de texxto, prioridad y puntuacion


# Detalles técnicos
- Se renderiza desde un template (#resenha-template) para mantener HTML reutilizable.

- Se usa un DocumentFragment para que la web no vaya lenta al añadir muchas tarjetas.

- el contador y las tarjetas se actualizan con los datos que vienen directamente del servidor.

- Endpoint Central: Todo pasa por http://localhost:3000/api/v1/tasks. Esto hace que si yo publico algo, tú lo puedas ver (persistencia compartida).
- sin embargo en la parte de marcar como leido es localStorage porque si yo le marco leido es por mi y no por los demás entonces esto ya sería más personal

- Arquitectura de Api Rest:
  - Antes se tenia LocaStorage, donde los datos se almacenaban de forma local, o sea solo tu mismo podias verlo en el navegador mediante una clave única.
  - con el Api Rest, se almacena todas las reseñas, con el endpoint (el que hace posible la comunicación entre cliente y servidor, recibiendo peticiones y devolviendo respuestas en JSOn en su mayoria) central cualquierapuede ver las reseñas de cualquiera que publico, asi se tiene una persistencia compartida.

- ahora el servidor es el que manda, si intentaré enviar una reseña vacia o sin texto, el servidor te frena.

- Express JSON: Usamos este middleware para que el servidor pueda leer y entender los objetos que enviamos desde el formulario.

# API REST:
 -GET: recupera el listado completo de reseñas.
  -ejemplo: 
    - Endpoint: http://localhost:3000/api/v1/tasks
    - el servidor recupera el array de objetos del modelo y lo envia como respuesta con un estado 200.

 -POST: crea una nueva reseña enviando un objeto JSON 
  - ejemplo:
    - Endpoint: http://localhost:3000/api/v1/tasks.
    - Datos que viajan y convierten en JSON: {"texto": "Ejemplo", "prioridad": "Profesional", "puntuacion": 4}
    - el middleware JSON traduce ese texto plano, el controlador valida los datos y el servidor responde con un 201 created.

 -DELETE: Elimina una reseña especiifica mediante su identificador.
  -Ejemplo:  http://localhost:3000/api/v1/tasks/:id
  - se envia el ID como parametro, el servidor filtra y elimina la coincidencia.


# Personalización rápida
- **Textos y secciones**: edita el contenido de `index.html`.
- **Colores/estilo**: ajusta clases Tailwind (`bg-*`, `text-*`, `dark:*`) directamente en `index.html`.
- **Tipos de reseña**:
  - Añade opciones en el `<select id="tipo-resenha">` en `index.html`.
  - Ajusta el mapeo de colores en `TIPO_CLASES` en `app.js`.





