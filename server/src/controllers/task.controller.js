const taskService = require('../services/task.service');

const getTasks = (req, res) => {
  const tasks = taskService.obtenerTodas();
  res.json(tasks);
};

const createTask = (req, res) => {
  const { texto, tipo, rating } = req.body;

  if (!texto || texto.length < 5) {
    return res.status(400).json({ 
      error: 'Datos inválidos', 
      message: 'El comentario debe tener al menos 5 caracteres' 
    });
  }

  const nueva = taskService.crearTarea({ texto, tipo, rating });
  res.status(201).json(nueva);
};

const deleteTask = (req, res) => {
  try {
    const { id } = req.params; // Extraemos el ID de la URL
    taskService.eliminarTarea(id); // Llamamos al servicio
    res.status(204).send(); // 204 = Éxito, pero no devuelvo contenido (estándar para borrar)
  } catch (error) {
    // Si el servicio lanzó el error 'NOT_FOUND', respondemos 404
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ 
        error: 'No encontrado', 
        message: 'La reseña que intentas borrar no existe.' 
      });
    }
    // Para cualquier otro error, dejamos que el Middleware Global (Fase C) lo capture
    throw error; 
  }
};
module.exports = { getTasks, createTask, deleteTask };