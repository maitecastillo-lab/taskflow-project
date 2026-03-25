// Simulación de base de datos en memoria
let tasks = [];

const obtenerTodas = () => {
  return tasks;
};

const crearTarea = (data) => {
  const nuevaTarea = {
    id: Date.now().toString(), // Genera un ID único
    titulo: data.titulo,
    completada: false,
    prioridad: data.prioridad || 1
  };
  tasks.push(nuevaTarea);
  return nuevaTarea;
};

const eliminarTarea = (id) => {
  const index = tasks.findIndex(t => t.id === id);
  // El ejercicio pide lanzar un error si el ID no existe
  if (index === -1) {
    throw new Error('NOT_FOUND');
  }
  tasks.splice(index, 1);
  return true;
};

module.exports = { obtenerTodas, crearTarea, eliminarTarea };