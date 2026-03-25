// ejecuta la configuración de dotenv
require('dotenv').config();

// validadación de si el process.env.port no existe de error
if (!process.env.PORT) {
  throw new Error('El puerto no está definido'); 
}

// se exportar para que otros archivos lo usen
module.exports = {
  PORT: process.env.PORT
};