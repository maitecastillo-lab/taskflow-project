// creamos una lista vacía en la memoria del servidor para guardar las reseñas.
// y como no usamos base de datos, esto hace de almacén.
let tareas = [];

// esta función sirve para enviar todas las reseñas que tenemos a la página web.
const getTasks = (req, res) => {
  // respondemos con un estado 200 (OK) y mandamos la lista de reseñas en formato JSON.
  res.status(200).json(tareas);
};

// esta función es la que recibe la nueva reseña.
const createTask = (req, res, next) => {
  try {
    // sacamos los datos que vienen de la pagina.
    // req.body es como la caja donde vienen los datos.
    const { texto, tipo, rating, puntuacion, prioridad } = req.body;

    // CONTROL DE ERRORES (Validación):
    // verificamos si reseña existe, si es texto y si mide al menos 3 letras.
    // si no cumple, el servidor se para y devuelve un error 400 (Bad Request).
    if (!texto || typeof texto !== 'string' || texto.trim().length < 3) {
      return res.status(400).json({
        error: "Validación fallida: La reseña es demasiado corta o está vacía."
      });
    }

    // CREACIÓN DEL OBJETO:
    // si todo está bien, hacemos la reseña con un ID único (usando la fecha actual).
    const nuevaReseña = {
      id: Date.now(),
      texto: texto,
      tipo: tipo || prioridad,
      rating: Number(rating || puntuacion)
    };

    // GUARDADO: Metemos la nueva reseña en nuestra lista de reseñas.
    tareas.push(nuevaReseña);

    // RESPUESTA: avisamos a la web que se creó con éxito (estado 201).
    res.status(201).json(nuevaReseña);

  } catch (error) {
    // si algo raro pasa (un fallo), se lo mandamos al middleware de errores.
    next(error);
  }
};

// esta función sirve para eliminar una reseña específica usando su ID.
const deleteTask = (req, res, next) => {
  try {
    const { id } = req.params;
    const totalAntes = tareas.length;

    // Filtramos
    tareas = tareas.filter(t => t.id !== parseInt(id));

    // BONUS: Si no se borró nada, enviamos un error 404 real
    if (tareas.length === totalAntes) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'No existe ninguna reseña con ese ID para eliminar'
      });
    }

    // ÉXITO: Respondemos con JSON para que el Frontend no explote (evita tu error de la foto)
    res.status(200).json({
      mensaje: 'Reseña eliminada correctamente',
      idEliminado: id
    });

  } catch (error) {
    next(error); // Enviamos cualquier fallo al middleware de index.js
  }
};

// EXPORTACIÓN: Esto es OBLIGATORIO para que 'task.routes.js' pueda ver las funciones.
module.exports = { getTasks, createTask, deleteTask };