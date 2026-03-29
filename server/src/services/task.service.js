let tasks = []; // Nuestra base de datos temporal

const taskService = {
    obtenerTodas: () => tasks,
    
    crearTarea: (data) => {
        const nuevaTarea = { 
            id: Date.now().toString(), 
            ...data,
            fecha: new Date().toLocaleDateString() 
        };
        tasks.push(nuevaTarea);
        return nuevaTarea;
    },
    
    eliminarTarea: (id) => {
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('NOT_FOUND');
        tasks.splice(index, 1);
        return true;
    }
};

module.exports = taskService;