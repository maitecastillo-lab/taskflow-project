// guardamos la dirección del servidor en una constante, el cual se pregunta
//donde esta funcionando, se vuelve inteligente por las opciones y se adapta
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') //esto se pregunta si dice el link localHsot o si es la IP
    ? 'http://localhost:3000/api/v1/tasks' //si es un SI entra a este y si no 
    : '/api/v1/tasks'; //entra a este.


// exportamos 'apiClient' con funciones que usaremos en el js.
export const apiClient = {
    async getTasks() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Error al obtener reseñas');
            return res.json();
        } catch (error) {
            console.error("Fallo al conectar:", error);
            return [];
        }
    },

    async createTask(data) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // CORRECCIÓN AQUÍ: Usamos los nombres que el Backend espera
                body: JSON.stringify({
                    texto: data.texto,
                    tipo: data.tipo,    // Cambiado de 'prioridad' a 'tipo'
                    rating: data.rating // Cambiado de 'puntuacion' a 'rating'
                })
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Error al publicar');
            }
            return result;
        } catch (error) {
            console.error("Error al crear: ", error);
            throw error;
        }
    },
    async deleteTask(id) {
        try {
            // enviamos la orden de borrar a la url del servidor + el id
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'error al borrar');
            }
            return true; // si llega aquí, es que lo borró bien
        } catch (error) {
            console.error("error al eliminar en el api:", error);
            throw error;
        }
    }
};