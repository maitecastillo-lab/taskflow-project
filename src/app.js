import { apiClient } from '/src/api/client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. configuración y variables
    // usamos esta clave para guardar tus checks de "leído" en tu ordenador
    const STORAGE_KEY = 'mis_resenhas_local';

    const TIPO_CLASES = Object.freeze({
        Personal: 'bg-slate-500 text-white',
        Académica: 'bg-slate-400 text-slate-900',
        Profesional: 'bg-slate-600 text-white',
    });

    const LI_BASE_CLASS = 'resenha-item bg-white dark:bg-slate-800 p-5 mb-5 rounded-[12px] border-l-[6px] border-l-slate-400 shadow-md flex justify-between items-center break-inside-avoid w-full transition-transform hover:translate-x-1';

    // capturamos los elementos del html por su id
    const form = document.getElementById('resenha');
    const mensaje = document.getElementById('texto');
    const categoria = document.getElementById('tipo');
    const estrellas = document.getElementById('rating');
    const lista = document.getElementById('listapubli');
    const themeBtn = document.getElementById('theme-toggle');
    const totalResenhasEl = document.getElementById('resenhas-total');
    const btnMarcarTodo = document.getElementById('btn-marcar-todo');
    const resenhaTemplate = document.getElementById('resenha-template');
    const selectorOrden = document.getElementById('orden-resenha');
    // esta lista guardará las reseñas que traigamos del servidor
    let misResenhas = [];

    // --- funciones de apoyo ---

    // genera la fecha de hoy con formato dd/mm/aaaa
    function fechaHoyFormateada() {
        const hoy = new Date();
        return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
    }

    // asegura que cada reseña tenga todos los datos necesarios para no dar error
    function normalizarResenha(item) {
        const base = { texto: '', tipo: 'Personal', rating: 5, fecha: fechaHoyFormateada(), leido: false };
        if (typeof item === 'string') return { ...base, texto: item };
        return { ...base, ...item, rating: Number(item.rating || 5) };
    }

    // crea un aviso flotante visual para el usuario
    function mostrarAviso({ mensaje }) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-5 right-5 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl z-[2000] border border-white/10 animate-pulse';
        toast.textContent = mensaje;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // --- lógica de pintado ---

    // esta función borra la lista actual y la vuelve a dibujar con los datos nuevos
    function pintarTarjetas() {
        lista.innerHTML = '';
        if (totalResenhasEl) totalResenhasEl.textContent = String(misResenhas.length);

        if (misResenhas.length === 0) {
            lista.innerHTML = `<li class="col-span-full py-10 text-center text-slate-400">aún no hay reseñas.</li>`;
            return;
        }

        misResenhas.forEach((res, idx) => {
            // usamos el template del html para crear cada tarjeta
            const clone = resenhaTemplate.content.cloneNode(true);
            const li = clone.querySelector('li');
            li.className = LI_BASE_CLASS;

            const tipoSpan = clone.querySelector('[data-role="tipo"]');
            tipoSpan.textContent = res.tipo;
            tipoSpan.className += ` ${TIPO_CLASES[res.tipo] || TIPO_CLASES.Personal}`;

            clone.querySelector('[data-role="texto"]').textContent = res.texto;
            clone.querySelector('[data-role="estrellas"]').textContent = '★'.repeat(res.rating) + '☆'.repeat(5 - res.rating);
            clone.querySelector('[data-role="fecha"]').textContent = res.fecha || fechaHoyFormateada();

            const checkLeido = clone.querySelector('[data-role="leido"]');
            if (res.leido) checkLeido.checked = true;

            // al cambiar el check, guardamos el estado solo en tu pc
            checkLeido.onchange = () => {
                res.leido = checkLeido.checked;
                guardarYActualizar();
            };

            const btnEliminar = clone.querySelector('[data-role="eliminar"]');
            btnEliminar.onclick = () => window.borrarResenha(idx);

            lista.appendChild(clone);
        });
    }

    // --- memoria local personal ---

    // guarda la lista actual en el localstorage para recordar tus checks personales
    function guardarYActualizar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(misResenhas));
        pintarTarjetas();
    }

    // --- acciones con el servidor ---

    // borra la reseña del servidor y luego de la pantalla
    window.borrarResenha = async (idx) => {
        const resenhaABorrar = misResenhas[idx];
        if (resenhaABorrar.id) {
            try {
                await apiClient.deleteTask(resenhaABorrar.id);
            } catch (error) {
                mostrarAviso({ mensaje: 'no se pudo borrar en el servidor' });
                return;
            }
        }
        misResenhas.splice(idx, 1);
        guardarYActualizar();
        mostrarAviso({ mensaje: 'reseña eliminada' });
    };

    // pide los datos al servidor y les aplica tus checks guardados en local
    async function cargarDatos() {
        try {
            const desdeServidor = await apiClient.getTasks();
            const locales = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

            misResenhas = desdeServidor.map(serverTask => {
                const localTask = locales.find(l => l.id === serverTask.id);
                return {
                    ...normalizarResenha(serverTask),
                    // si en tu pc estaba marcada como leída, le ponemos el check
                    leido: localTask ? localTask.leido : false
                };
            });
            pintarTarjetas();
        } catch (e) {
            console.error("error al conectar con el servidor");
            // si falla el servidor, mostramos lo que tengamos en el pc
            misResenhas = (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map(normalizarResenha);
            pintarTarjetas();
        }
    }


    // al enviar el formulario, mandamos la reseña al servidor
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textoResenha = mensaje.value.trim();

        if (textoResenha.length < 5) {
            mostrarAviso({ mensaje: '¡la reseña es demasiado corta!' });
            return;
        }

        const btn = document.getElementById('boton-publicar');
        btn.disabled = true;
        btn.textContent = 'enviando...';

        try {
            const datosParaEnviar = {
                texto: textoResenha,
                tipo: categoria.value,
                rating: Number(estrellas.value)
            };
            const nueva = await apiClient.createTask(datosParaEnviar);
            misResenhas.push(normalizarResenha(nueva));
            form.reset();
            guardarYActualizar();
            mostrarAviso({ mensaje: '¡publicada con éxito!' });
        } catch (error) {
            mostrarAviso({ mensaje: 'error al publicar' });
        } finally {
            btn.disabled = false;
            btn.textContent = 'publicar';
        }
    });

    // marca todas las reseñas como leídas solo en este equipo
    btnMarcarTodo.addEventListener('click', () => {
        misResenhas.forEach(r => r.leido = true);
        guardarYActualizar();
        mostrarAviso({ mensaje: 'todo marcado como leído en este equipo' });
    });

    // cambia entre modo claro y oscuro
    themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
    });

    //mas antigua a mas reciente

    // buscamos el select de orden en el html
    selectorOrden.addEventListener('change', () => {
        const valor = selectorOrden.value;

        // ordenamos el array 'misResenhas'
        misResenhas.sort((a, b) => {
            // 1. preparamos las fechas para comparar (dd/mm/aaaa -> aaaa-mm-dd)
            const fechaA = new Date(a.fecha.split('/').reverse().join('-'));
            const fechaB = new Date(b.fecha.split('/').reverse().join('-'));

            const diferenciaFechas = fechaA - fechaB;

            if (diferenciaFechas !== 0) {
                // si las fechas son distintas, aplicamos el orden elegido
                return valor === 'nuevo' ? fechaB - fechaA : fechaA - fechaB;
            } else {
                // 2. si son del mismo día, desempatamos con el ID (el más alto es el más nuevo)
                // como el ID es un string ("177..."), lo convertimos a número para restar
                return valor === 'nuevo' ? Number(b.id) - Number(a.id) : Number(a.id) - Number(b.id);
            }
        });

        // ¡importante! volvemos a pintar para que se vea el cambio en pantalla
        pintarTarjetas();
    });

    // ejecutamos la carga inicial al abrir la página
    cargarDatos();
});