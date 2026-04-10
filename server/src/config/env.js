// Carga las variables del archivo .env (solo para local)
require('dotenv').config();

// Exportamos el puerto. 
// Si Render nos da uno (process.env.PORT), lo usamos.
// Si no hay ninguno (como en tu PC), usamos el 3000 por defecto.
module.exports = {
    PORT: process.env.PORT || 3000,
    // Si tienes otras variables como MONGO_URI, añádelas aquí abajo:
    MONGO_URI: process.env.MONGO_URI 
};