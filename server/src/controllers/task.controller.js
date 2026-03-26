// almacén temporal en memoria
let tareas = [];

// función para obtener todas las reseñas (GET)
const getTasks = (req, res) => {
  res.status(200).json(tareas);
};

// función para crear una reseña (POST) ç
const createTask = (req, res, next) => {
  try {
    // Extraemos todos los nombres posibles que envía el cliente
    const { texto, tipo, rating, puntuacion, prioridad } = req.body;

    // validación: El texto es obligatorio
    if (!texto || typeof texto !== 'string' || texto.trim().length < 3) {
      return res.status(400).json({
        error: "Validación fallida: La reseña es demasiado corta o está vacía."
      });
    }

    // creamos el objeto final usando el operador "||" para ser flexibles
    const nuevaReseña = {
      id: Date.now(),
      texto: texto.trim(),
      tipo: tipo || prioridad || 'Personal',
      rating: Number(rating || puntuacion || 5)
    };

    // guardamos en la lista
    tareas.push(nuevaReseña);

    // enviamos la respuesta JSON (Esto evita el "Error desconocido")
    return res.status(201).json(nuevaReseña);

  } catch (error) {
    // si algo falla, lo mandamos al manejador de errores
    next(error);
  }
};

// función para eliminar una reseña (DELETE)
const deleteTask = (req, res, next) => {
  try {
    const { id } = req.params;
    const totalAntes = tareas.length;

    // Filtramos la lista para quitar la que coincide con el ID
    tareas = tareas.filter(t => t.id !== parseInt(id));

    if (tareas.length === totalAntes) {
      return res.status(404).json({
        error: 'No encontrado',
        message: 'No existe ninguna reseña con ese ID'
      });
    }

    res.status(200).json({
      mensaje: 'Reseña eliminada correctamente',
      idEliminado: id
    });

  } catch (error) {
    next(error);
  }
};

// exportación obligatoria
module.exports = { getTasks, createTask, deleteTask };