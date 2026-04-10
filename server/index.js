require('dotenv').config(); 
const express = require('express'); 
const cors = require('cors'); 
const path = require('path'); 
const taskRoutes = require('./src/routes/task.routes.js');
const PORT = process.env.PORT || 3000;
const app = express(); 

// --- MIDDLEWARES ---
app.use(cors()); 
app.use(express.json()); 

// ESTO ARREGLA LA IMAGEN Y LOS SCRIPTS
app.use(express.static(__dirname)); 

// --- RUTAS API ---
app.use('/api/v1/tasks', taskRoutes); 

// 2. ESTO CARGA TU PÁGINA WEB AL ENTRAR
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- MANEJADOR DE ERRORES (FASE C) ---
app.use((err, req, res, next) => {
  console.error("Traza del error", err.stack);

  if(err.message === 'NOT_FOUND'){
    return res.status(404).json({
      error: 'No encontrado',
      message: 'La reseña que intentas buscar no existe o ha sido eliminada',
    });
  }

  if(err.name === 'ValidationError' || err.status === 400){
    return res.status(400).json({
      error: 'Datos inválidos',
      message: err.message
    });
  }

  res.status(500).json({
    error: 'Error del servidor',
    message: 'Hubo un problema al procesar la reseña.'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
