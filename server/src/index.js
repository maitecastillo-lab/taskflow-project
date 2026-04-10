
// Cargamos las variables de entorno (Configuración vital)
require('dotenv').config(); 
const express = require('express'); 
const cors = require('cors'); 
const path = require('path'); 

// importamos las rutas profesionales (Ingeniería del dominio)
// el archivo debe estar en server/src/routes/task.routes.js
const taskRoutes = require('./routes/task.routes');

const app = express(); 

// --- MIDDLEWARES ---
app.use(cors()); 
app.use(express.json()); // Permite procesar el req.body de las reseñas

app.use('/api/v1/tasks', taskRoutes);

// Importante: usamos '../../' para salir de 'src' y 'server' hasta la raíz
app.use(express.static(path.join(__dirname, '../../'))); 

// Ruta para cargar el archivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

app.use((err, req, res, next) => {
  // Registramos la traza del error en consola (solo visible para nosotros)
  console.error("Traza del error detectada:", err.stack);

  // Mapeo semántico de errores HTTP
  if (err.message === 'NOT_FOUND') {
    return res.status(404).json({
      error: 'No encontrado',
      message: 'La reseña solicitada no existe o ha sido eliminada.'
    });
  }

  // Error 500 para fallos no controlados (Garantiza seguridad técnica)
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Hubo un problema inesperado al procesar la reseña.'
  });
});

// --- EXPORTACIÓN PARA VERCEL ---
module.exports = app;

// --- ARRANQUE DEL SERVIDOR (Configuración para Render) ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Exportación (útil si algún día vuelves a usar Vercel)
module.exports = app;