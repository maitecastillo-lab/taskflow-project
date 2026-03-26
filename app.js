import { apiClient } from '/src/api/client.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Configuración y Variables
    const STORAGE_KEY = 'mis_resenhas';
    const TIPO_CLASES = Object.freeze({
        Personal: 'bg-slate-500 text-white',
        Académica: 'bg-slate-400 text-slate-900',
        Profesional: 'bg-slate-600 text-white',
    });
    const LI_BASE_CLASS = 'resenha-item bg-white dark:bg-slate-800 p-5 mb-5 rounded-[12px] border-l-[6px] border-l-slate-400 shadow-md flex justify-between items-center break-inside-avoid w-full transition-transform hover:translate-x-1';

    const form = document.getElementById('resenha');
    const mensaje = document.getElementById('texto');
    const categoria = document.getElementById('tipo');
    const estrellas = document.getElementById('rating');
    const lista = document.getElementById('listapubli');
    const themeBtn = document.getElementById('theme-toggle');
    const totalResenhasEl = document.getElementById('resenhas-total');
    const btnMarcarTodo = document.getElementById('btn-marcar-todo');
    const resenhaTemplate = document.getElementById('resenha-template');

    let misResenhas = [];

    // --- FUNCIONES DE APOYO ---
    function fechaHoyFormateada() {
        const hoy = new Date();
        return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
    }

    function normalizarResenha(item) {
        const base = { texto: '', tipo: 'Personal', rating: 5, fecha: fechaHoyFormateada(), leido: false };
        if (typeof item === 'string') return { ...base, texto: item };
        return { ...base, ...item, rating: Number(item.rating || 5) };
    }

    function mostrarAviso({ mensaje }) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-5 right-5 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl z-[2000] border border-white/10 animate-pulse';
        toast.textContent = mensaje;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // --- LÓGICA DE PINTADO (Adaptada a tu Template) ---
    function pintarTarjetas() {
        lista.innerHTML = '';
        if (totalResenhasEl) totalResenhasEl.textContent = String(misResenhas.length);

        if (misResenhas.length === 0) {
            lista.innerHTML = `<li class="col-span-full py-10 text-center text-slate-400">Aún no hay reseñas.</li>`;
            return;
        }

        misResenhas.forEach((res, idx) => {
            // 1. Clonamos el template
            const clone = resenhaTemplate.content.cloneNode(true);

            // 2. Buscamos los huecos y metemos la info
            const li = clone.querySelector('li');
            li.className = LI_BASE_CLASS;

            const tipoSpan = clone.querySelector('[data-role="tipo"]');
            tipoSpan.textContent = res.tipo;
            tipoSpan.className += ` ${TIPO_CLASES[res.tipo] || TIPO_CLASES.Personal}`;

            clone.querySelector('[data-role="texto"]').textContent = res.texto;
            clone.querySelector('[data-role="estrellas"]').textContent = '★'.repeat(res.rating) + '☆'.repeat(5 - res.rating);
            clone.querySelector('[data-role="fecha"]').textContent = res.fecha || fechaHoyFormateada();

            const checkLeido = clone.querySelector('[data-role="leido"]');

            // Si la reseña está marcada como leída en los datos, ponemos el check
            if (res.leido) {
                checkLeido.checked = true;
            }

            // Para que el usuario también pueda marcar/desmarcar a mano
            checkLeido.onchange = () => {
                res.leido = checkLeido.checked;
                guardarYActualizar();
            };

            // 3. Botón eliminar
            const btnEliminar = clone.querySelector('[data-role="eliminar"]');
            btnEliminar.onclick = () => window.borrarResenha(idx);

            lista.appendChild(clone);
        });
    }

    // --- ACCIONES (Hogares de las funciones de borrar y actualizar) ---
    function guardarYActualizar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(misResenhas));
        pintarTarjetas();
    }

    window.borrarResenha = (idx) => {
        misResenhas.splice(idx, 1);
        guardarYActualizar();
        mostrarAviso({ mensaje: 'Reseña eliminada' });
    };

    // --- CARGA INICIAL (CONECTAR CON SERVIDOR) ---
    async function cargarDatos() {
        try {
            const desdeServidor = await apiClient.getTasks();
            misResenhas = desdeServidor.map(normalizarResenha);
            pintarTarjetas();
        } catch (e) {
            console.error("Cargando de reserva local...");
            misResenhas = (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map(normalizarResenha);
            pintarTarjetas();
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // guardamos el texto en una variable y quitamos los espacios vacíos
        const textoResenha = mensaje.value.trim();

        // Si el texto tiene menos de 3 letras, paramos aquí
        if (textoResenha.length < 5) {
            mostrarAviso({
                mensaje: '¡La reseña es demasiado corta!'
            });
            return;
        }

        const btn = document.getElementById('boton-publicar');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
            const datosParaEnviar = {
                texto: textoResenha, // Usamos la variable que ya limpiamos arriba
                tipo: categoria.value,
                rating: Number(estrellas.value)
            };

            const nueva = await apiClient.createTask(datosParaEnviar);

            // Añadimos la respuesta del servidor a nuestra lista
            misResenhas.push(normalizarResenha(nueva));
            form.reset();
            guardarYActualizar();
            mostrarAviso({ mensaje: '¡Publicada con éxito!' });

        } catch (error) {
            console.error(error);
            mostrarAviso({ mensaje: 'Error al publicar: ' + error.message });
        } finally {
            btn.disabled = false;
            btn.textContent = 'Publicar';
        }
    });

    btnMarcarTodo.addEventListener('click', () => {
        // recorremos todas las reseñas y ponemos su estado en 'true'
        misResenhas.forEach(r => {
            r.leido = true;
        });

        // guardamos este cambio y volvemos a pintar las tarjetas
        // esto es clave porque 'pintarTarjetas' leerá el nuevo estado 'leido: true'
        guardarYActualizar();

        // mostramos el mensaje de confirmación
        mostrarAviso({ mensaje: 'Todo marcado como leído' });
    });

    themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
    });

    // Arrancamos la web cargando los datos
    cargarDatos();
});