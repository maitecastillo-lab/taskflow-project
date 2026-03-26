import { apiClient } from './src/api/client.js';
document.addEventListener('DOMContentLoaded', () => {

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
    const resenhaTemplate = document.getElementById('resenha-template');
    const themeBtn = document.getElementById('theme-toggle');
    const totalResenhasEl = document.getElementById('resenhas-total');

    /**
     * Habilita el "tilt 3D" de la sección "Sobre mí" también en móvil.
     *
     * Diseño:
     * - En desktop el efecto se activa con `group-hover:*` (CSS/Tailwind).
     * - En móvil no existe hover real; al tocar una tarjeta alternamos la clase `is-flipped`.
     *
     * Nota: usamos una marca interna (`_flipDelegated`) para evitar registrar el listener más de una vez.
     */
    const sobreMi = document.getElementById('sobre-mi');
    if (sobreMi && !sobreMi._flipDelegated) {
        sobreMi.addEventListener('click', (e) => {
            const card = e.target.closest('article.group');
            if (!card) return;
            card.classList.toggle('is-flipped');
        });
        sobreMi._flipDelegated = true;
    }

    /**
     * Devuelve la fecha de hoy en formato `DD/MM/AAAA`.
     *
     * Se usa para asignar fecha a nuevas reseñas y para migrar reseñas antiguas
     * que no tengan `fecha` en LocalStorage.
     *
     * @returns {string} Fecha formateada.
     */
    function fechaHoyFormateada() {
        const hoy = new Date();
        const dd = String(hoy.getDate()).padStart(2, '0');
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const yyyy = hoy.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    /**
     * Normaliza una reseña para garantizar estructura estable en UI/LocalStorage.
     *
     * Soporta:
     * - reseñas antiguas guardadas como string (solo texto)
     * - reseñas modernas como objeto `{ texto, tipo, rating, fecha, leido }`
     *
     * Reglas:
     * - `tipo` por defecto: "Personal"
     * - `rating` por defecto: 5 (y debe ser número)
     * - `fecha`: si no existe o es inválida, se rellena con la fecha de hoy (DD/MM/AAAA)
     *
     * @param {unknown} item
     * @returns {{texto: string, tipo: string, rating: number, fecha: string, leido: boolean}}
     */
    function normalizarResenha(item) {
        const base = {
            texto: '',
            tipo: 'Personal',
            rating: 5,
            fecha: fechaHoyFormateada(),
            leido: false,
        };

        if (typeof item === 'string') {
            return { ...base, texto: item };
        }

        if (item && typeof item === 'object') {
            const leido = typeof item.leido === 'boolean' ? item.leido : base.leido;
            return {
                ...base,
                ...item,
                tipo: item.tipo || item.prioridad || base.tipo,
                rating: typeof item.rating === 'number' ? item.rating : base.rating,
                fecha: typeof item.fecha === 'string' && item.fecha.trim()
                    ? item.fecha
                    : base.fecha,
                leido,
            };
        }

        return { ...base, texto: String(item) };
    }

    /**
     * Devuelve las clases Tailwind para el "badge" de tipo.
     *
     * @param {string} tipo
     * @returns {string}
     */
    function claseParaTipo(tipo) {
        return TIPO_CLASES[tipo] ?? TIPO_CLASES.Personal;
    }

    /**
     * Convierte un rating numérico (1..5) en estrellas "★★★★★☆☆☆☆☆".
     *
     * @param {number} rating
     * @returns {string}
     */
    function estrellasParaRating(rating) {
        const n = Math.max(1, Math.min(5, rating || 5));
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    /**
     * Genera una etiqueta accesible para el botón "Eliminar" (screen readers).
     *
     * @param {{texto: string, tipo: string, rating: number}} params
     * @returns {string}
     */
    function labelEliminarParaResenha({ texto, tipo, rating }) {
        const snippet = String(texto || '').trim().slice(0, 40);
        const sufijo = snippet.length === 40 ? '…' : '';
        return `Eliminar reseña (${tipo}, ${rating} de 5): ${snippet}${sufijo}`;
    }

    /**
     * Muestra un "toast" (notificación no intrusiva) en la esquina superior derecha.
     *
     * Detalles:
     * - Crea el contenedor una sola vez (`#toast-container`) y reutiliza.
     * - Es accesible: `role="status"` + `aria-live="polite"`.
     * - Se auto-destruye tras `durationMs` y limpia el contenedor si queda vacío.
     *
     * @returns {void}
     */
    function mostrarAviso({ accion, mensaje, durationMs = 5000 }) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.className = 'max-w-xs px-4 py-2 rounded-lg bg-slate-900/70 text-white text-sm shadow-lg border border-white/10 backdrop-blur-sm';

        // condicional de que si existe "accion", la pone. Si no, solo pone el mensaje. 
        //para que ya no salga la acción en el mensaje.
        toast.textContent = accion ? `${accion}: ${mensaje}` : mensaje;

        container.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
            if (container && container.childElementCount === 0) container.remove();
        }, durationMs);
    }

    /**
     * Resetea el formulario a sus valores iniciales.
     *
     * @returns {void}
     */
    function resetFormularioResenha() {
        input.value = '';
        tipoSelect.value = 'Personal';
        ratingSelect.value = '5';
    }

    /**
     * Sanea mínimos caracteres peligrosos para evitar inyección de HTML.
     *
     * Nota: además de esto, la UI usa `textContent` (no `innerHTML`) para imprimir
     * texto de usuario, así que es una defensa extra.
     *
     * @param {unknown} texto
     * @returns {string}
     */
    function limpiarTexto(texto) {
        return String(texto).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /**
     * Normaliza el mensaje para mostrarlo de forma consistente.
     * - recorta espacios
     * - colapsa espacios repetidos
     * - pone la primera letra en mayúscula
     *
     * @param {unknown} texto
     * @returns {string}
     */
    function normalizarMensaje(texto) {
        const limpio = String(texto).trim().replace(/\s+/g, ' ').toLowerCase();
        if (!limpio) return '';
        return limpio.charAt(0).toUpperCase() + limpio.slice(1);
    }

    /**
     * Evita publicar duplicados exactos (texto + tipo + rating).
     *
     * @param {string} texto
     * @param {string} tipo
     * @param {number} rating
     * @returns {boolean}
     */
    function esResenhaRepetida(texto, tipo, rating) {
        return misResenhas.some(
            (r) => r.texto === texto && r.tipo === tipo && r.rating === rating
        );
    }

    themeBtn.setAttribute('aria-pressed', document.documentElement.classList.contains('dark'));
    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        themeBtn.setAttribute('aria-pressed', isDark);
    });

    let misResenhas = (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []).map(normalizarResenha);

    /**
     * Persistencia única del estado:
     * - guarda `misResenhas` en LocalStorage (una sola clave)
     * - repinta la lista para mantener UI y estado sincronizados (contador incluido)
     *
     * @returns {void}
     */
    function guardarYActualizar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(misResenhas));
        pintarTarjetas();
    }

    /**
     * Renderiza el listado de reseñas de forma eficiente.
     *
     * Responsabilidades:
     * - Vacía el contenedor y actualiza el contador.
     * - Muestra estado vacío cuando no hay reseñas.
     * - Pinta tarjetas desde el `template` en un `DocumentFragment` (menos reflows).
     * - Registra (una sola vez) un listener delegado para "Eliminar".
     *
     * @returns {void}
     */
    function pintarTarjetas() {
        lista.innerHTML = '';
        if (totalResenhasEl) totalResenhasEl.textContent = String(misResenhas.length);
        if (misResenhas.length === 0) {
            lista.style.columnCount = 1;
            lista.innerHTML = `<li class="col-span-full w-full text-center text-gray-400 py-8 text-lg font-medium flex flex-col items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" class="w-10 h-10 text-slate-400 mx-auto"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 8l4 4M7.6 25.1c-.6.1-1.1-.4-1-1l.6-3.1c.1-.4.2-.7.5-1l13.3-13.3c.8-.8 2-.8 2.8 0l2.1 2.1c.8.8.8 2 0 2.8L12.6 25.1c-.3.3-.6.5-1 .6l-3 .6z"/></svg>
                Aún no hay reseñas. ¡Sé el primero en escribir una!
            </li>`;
            return;
        }
        lista.style.removeProperty('column-count');

        const fragment = document.createDocumentFragment();
        misResenhas.forEach((resenha, idx) => {
            const { texto, tipo, rating, fecha, leido } = resenha;

            const node = resenhaTemplate.content.firstElementChild.cloneNode(true);
            node.className = `${LI_BASE_CLASS} resenha-item flex`;

            const tipoEl = node.querySelector('[data-role="tipo"]');
            const estrellasEl = node.querySelector('[data-role="estrellas"]');
            const fechaEl = node.querySelector('[data-role="fecha"]');
            const textoEl = node.querySelector('[data-role="texto"]');
            const eliminarBtn = node.querySelector('[data-role="eliminar"]');
            const leidoCheckbox = node.querySelector('[data-role="leido"]');

            tipoEl.className = `inline-flex items-center px-2 py-0.5 rounded-full ${claseParaTipo(tipo)}`;
            tipoEl.textContent = tipo;

            estrellasEl.textContent = estrellasParaRating(rating);
            estrellasEl.setAttribute('aria-label', `Puntuación ${rating} de 5`);

            if (fechaEl) {
                fechaEl.textContent = fecha;
                fechaEl.setAttribute('aria-label', `Fecha de publicación: ${fecha}`);
            }

            // Seguridad: nunca insertamos el texto del usuario con innerHTML
            textoEl.textContent = normalizarMensaje(texto);

            eliminarBtn.dataset.idx = String(idx);
            eliminarBtn.setAttribute('aria-label', labelEliminarParaResenha({ texto, tipo, rating }));

            if (leidoCheckbox) {
                leidoCheckbox.dataset.idx = String(idx);
                leidoCheckbox.checked = Boolean(leido);
                leidoCheckbox.setAttribute('aria-label', leidoCheckbox.checked ? 'Marcar como no leído' : 'Marcar como leído');
            }

            fragment.appendChild(node);
        });
        lista.appendChild(fragment);

        // Delegar el evento click en los botones eliminar para evitar leaks de memoria y múltiples listeners
        // (Esto solo los añade si aún no estaba el listener)
        if (!lista._eventsDelegated) {
            lista.addEventListener('click', function (e) {
                const btn = e.target.closest('button[data-idx]');
                if (btn) {
                    const idx = Number(btn.getAttribute('data-idx'));
                    borrarResenha(idx);
                }
            });
            lista.addEventListener('change', function (e) {
                const checkbox = e.target.closest('input[type="checkbox"][data-idx]');
                if (!checkbox) return;
                const idx = Number(checkbox.getAttribute('data-idx'));
                if (!Number.isFinite(idx) || !misResenhas[idx]) return;
                misResenhas[idx].leido = checkbox.checked;
                guardarYActualizar();
            });
            lista._eventsDelegated = true;
        }
    }

    pintarTarjetas();
    // añado 'async' para poder esperar al servidor
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const boton = document.getElementById('boton-publicar');
        //estado de carga
        boton.disabled = true;
        boton.textContent = 'Enviando...';

        try {
            const textoLimpio = limpiarTexto(normalizarMensaje(mensaje.value));

            if (!textoLimpio) {
                throw new Error("La reseña no puede estar vacía");
            }

            // Usamos 'categoria' y 'estrellas' (tus variables de las líneas 14 y 15)
            const categoriaElegida = categoria.value;
            const ratingElegido = Number(estrellas.value) || 5;

            // Conexión con el servidor
            const nuevaResenhaServidor = await apiClient.createTask({
                texto: textoLimpio,
                tipo: categoriaElegida,
                rating: ratingElegido
            });

            // Si el servidor responde bien, actualizamos la lista
            misResenhas.push(normalizarResenha(nuevaResenhaServidor));

            guardarYActualizar();

            // Limpiamos el formulario (usando tus variables correctas)
            mensaje.value = '';
            categoria.value = 'Personal';
            estrellas.value = '5';

            pintarTarjetas();
            mostrarAviso({ mensaje: '¡Reseña guardada con éxito!' });

        } catch (error) {
            mostrarAviso({ mensaje: `Error: ${error.message}` });
        } finally {
            ///pase lo que pase, devolvemos el botón a su estado original.
            boton.disabled = false;
            boton.textContent = 'Publicar';
        }
    });

    /**
      * Elimina una reseña por índice y sincroniza API REST + LocalStorage + UI.
      */
    window.borrarResenha = async (indice) => {
        try {
            // 1. Identificamos qué reseña queremos borrar
            const resenhaABorrar = misResenhas[indice];

            // 2. Si la reseña tiene un ID, avisamos al servidor (API REST)
            if (resenhaABorrar && resenhaABorrar.id) {
                await apiClient.deleteTask(resenhaABorrar.id);
            }

            // 3. Si el servidor responde OK (o si no tenía ID por ser antigua),
            // la borramos de nuestra lista local
            misResenhas.splice(indice, 1);

            // 4. Guardamos en LocalStorage y repintamos la pantalla
            guardarYActualizar();

            mostrarAviso({
                mensaje: 'Reseña eliminada correctamente del servidor',
                durationMs: 3000,
            });

        } catch (error) {
            console.error("Fallo al borrar:", error);
            mostrarAviso({
                mensaje: 'No se pudo eliminar: ' + error.message,
                durationMs: 5000,
            });
        }
    };

    // MARCAR TODO COMO LEÍDO 
    // apturamos el botón que añadimos en el HTML
    const btnMarcarTodo = document.getElementById('btn-marcar-todo');

    btnMarcarTodo.addEventListener('click', () => {
        //Verificamos si hay reseñas 
        if (misResenhas.length === 0) return;

        // Modificamos el array misResenhas
        // Como es el estado de tu aplicación.
        misResenhas.forEach(resenha => {
            resenha.leido = true;
        });

        // Invocamos tu función maestra que guarda en LocalStorage y repinta la UI
        guardarYActualizar();

        // Opcional: Mostrar un aviso usando tu función mostrarAviso
        mostrarAviso({
            mensaje: 'Todas las reseñas han sido marcadas como leídas',
            durationMs: 3000
        });
    });


    const buscador = document.getElementById('buscador');
    buscador.addEventListener('input', () => {
        const filtro = buscador.value.toLowerCase();
        document.querySelectorAll('.resenha-item').forEach((tarjeta) => {
            const texto = tarjeta.querySelector('.break-words')?.textContent?.toLowerCase() ?? '';
            const visible = texto.includes(filtro);
            tarjeta.classList.toggle('hidden', !visible);
            tarjeta.classList.toggle('flex', visible);
        });
    });
}); 