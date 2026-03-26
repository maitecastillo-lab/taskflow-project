require('dotenv').config(); // carga las variables del archivo .env 
const express = require('express'); //la libreria para creal el servidor
const cors = require('cors'); // el "permiso" para que pueda comunicarse entre ellos el fronted y backend
const taskRoutes = require('./server/routes/task.routes.js');
const PORT = process.env.PORT || 3000;
const app = express(); //aqui creamos el sevidor

//mMIDDLEWARES
app.use(cors()); // permite que en la pagina entre a pedir datos al servidor
app.use(express.json()); //aqui entiende una tarea en formato JSON
app.use(express.urlencoded({extended: true}));

app.use('/api/v1/tasks', taskRoutes); //para activar las rutas

app.get('/', (req, res) => {
  res.send('Servidor de TaskFlow funcionando correctamente');
});


//fase C:
// agregamos un middleware para tener controlado los erroes
app.use((err, req, res, next) => {
  //registro la taza del error 
  console.error("Traza del error", err.stack);
  //mapeo de los errores
  //si el error es "no encontrado":
  if(err.message === 'NOT_FOUND'){ //es triple = para una iguladad estricta, comparando valor y el tipo de edato
    //la respuesta es un 404
    return res.status(404).json({
      error: 'No encontrado',
      message: 'La reseña que intentas buscar no existe o ha sido eliminada',
    })
  }

  // si es un error de validación.
  if(err.name === 'ValidationError' || err.status === 400){
    return res.status(400).json({
      error: 'Datos inválidos',
      message: err.message
    });
  }
  //error del servidor
  res.status(500).json({
    error: 'Error del servidor',
    message: 'Hubo un problema al procesar la reseña. Intentalo más tarde'
  });
});



//esto es al final porque es lo abre.
// Solo encendemos el servidor con .listen si estamos en nuestro ordenador (Local)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

// Esto es lo que Vercel necesita SIEMPRE
module.exports = app;
