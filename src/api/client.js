// guardamos la dirección del servidor en una constante, el cual se pregunta
//donde esta funcionando, se vuelve inteligente por las opciones y se adapta
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') //esto se pregunta si dice el link localHsot o si es la IP
    ? 'http://localhost:3000/api/v1/tasks' //si es un SI entra a este y si no 
    : '/api/v1/tasks'; //entra a este.

// exportamos 'apiClient' con funciones que usaremos en el js.
export const apiClient = {
    // trae los datos que es el get
    async getTasks() {
        try {
            // fetch lanza la petición a la red y espera la respuesta.
            const res = await fetch(API_URL);

            // si el servidor responde mal como un error, lanzamos un error.
            if (!res.ok) {
                throw new Error('Error al obtener reseñas del servidor');
            }
            // si todo va bien, convertimos los datos de JSON a un objeto que JS entienda.
            return res.json();
        } catch (error) {
            //gestiond e error: si no hay internet o el sevidor esta caido.
            console.error("Fallo al conectar:", error);
            alert("No se pudieron cargar las reseñas. Comprueba tu conexión.")
            return []; //se devuelve algo vacio para que la web no se rompa
        }
    },

    // se crea una funcion para mandar las reseñas (post)
    async createTask(data) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    texto: data.texto,
                    prioridad: data.tipo,
                    puntuacion: data.rating
                })
            });

            // comprobamos si la respuesta es OK
            if (!res.ok) {
                // Si hay error, intentamos leer el mensaje de error del servidor
                const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(errorData.error || 'La reseña no se pudo publicar');
            }

            // leemos el resultado final
            const result = await res.json();
            return result;

        } catch (error) {
            console.error("Error al crear: ", error);
            alert("Error: " + error.message);
            throw error;
        }
    },
    // Función para borrar una reseña del servidor -delete-
    async deleteTask(id) {
        try {
            // Construimos la URL con el ID al final,
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE', // Indicamos que es un borrado
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'No se pudo eliminar la reseña');
            }

            return result; // Devolvemos la confirmación del servidor
        } catch (error) {
            console.error("Error al eliminar:", error);
            throw error;
        }
    }
};