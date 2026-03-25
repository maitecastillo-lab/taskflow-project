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
            // Enviamos la petición indicando que es un POST (creación).
            const res = await fetch(API_URL, {
                method: 'POST',
                // Decimos al servidor que lo que le estamos mandando es json.
                headers: { 'Content-Type': 'application/json' },
                // convertimos la reseña en texto JSON para que pueda ser procesado por el sistema.
                body: JSON.stringify({
                    texto: data.texto, // Tu backend espera la palabra 'texto'
                    prioridad: data.tipo,
                    puntuacion: data.rating
                })
            });
             // esperamos la respuesta del servidor.
            const result = await res.json();

            //gestion de error del backend: si el texto es muy corto:
            if(!res.ok){
                throw new Error(result.error || 'La reseña es muy corta, no se puede publicar')
            }
            return result;
        }catch (error){
            //gestion error de red
            console.error("Error al crear: ", error);
            alert("Error: " + error.message);
            throw error; //lanzamos el error para que sepa que fallo.

        }
    }
};