# PROYECTO TASKFLOW (adecuado a mi proyecto)
Este es mi proyecto para la gestión de reseñas. Lo hice usando Node.js
y Express para el servidor. La idea es que el usuario pueda escribir una reseña, 
ponerle una categoría, una nota y que pueda marcarlo como visto pero eso es local
y que se queden guardadas para verlas después.

# ¿Cómo está ordenado el código?
Dividí todo por carpetas para no tener un solo archivo gigante y que sea más fácil encontrar las cosas:
- config: Aquí está el env.js con el puerto del servidor.
- controllers: Aquí está la lógica de las reseñas.
- routes: Aquí definí las rutas de la API para que el frontend sepa a dónde llamar.
- services: Aquí es donde se maneja el guardado de los datos.
   client.js: Este archivo es clave porque es el que conecta mi página con el servidor.
# Tecnologias utilizadas
- HTML
- CSS
- Tailwind
- JavaScript
- Express
- Node.js
