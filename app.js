document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY = 'mis_resenhas';
    const TIPO_CLASES = {
        Personal: 'bg-slate-500 text-white',
        Académica: 'bg-slate-400 text-slate-900',
        Profesional: 'bg-slate-600 text-white',
    };
    const LI_BASE_CLASS = 'resenha-item bg-white dark:bg-slate-800 p-5 mb-5 rounded-[12px] border-l-[6px] border-l-slate-400 shadow-md flex justify-between items-center break-inside-avoid w-full transition-transform hover:translate-x-1';

    const form = document.getElementById('resenha');
    const input = document.getElementById('texto');
    const tipoSelect = document.getElementById('tipo-resenha');
    const ratingSelect = document.getElementById('rating');
    const lista = document.getElementById('listapubli');
    const resenhaTemplate = document.getElementById('resenha-template');
    const themeBtn = document.getElementById('theme-toggle');
    const totalResenhasEl = document.getElementById('resenhas-total');

    function normalizarResenha(item) {
        if (typeof item === 'string') return { texto: item, tipo: 'Personal', rating: 5 };
        if (item && typeof item === 'object') {
            return {
                texto: item.texto ?? '',
                tipo: item.tipo ?? 'Personal',
                rating: typeof item.rating === 'number' ? item.rating : 5,
            };
        }
        return { texto: String(item), tipo: 'Personal', rating: 5 };
    }

    function claseParaTipo(tipo) {
        return TIPO_CLASES[tipo] ?? TIPO_CLASES.Personal;
    }

    function estrellasParaRating(rating) {
        const n = Math.max(1, Math.min(5, rating || 5));
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    }

    function labelEliminarParaResenha({ texto, tipo, rating }) {
        const snippet = String(texto || '').trim().slice(0, 40);
        const sufijo = snippet.length === 40 ? '…' : '';
        return `Eliminar reseña (${tipo}, ${rating} de 5): ${snippet}${sufijo}`;
    }

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
        toast.textContent = `Acción: ${accion}. ${mensaje}`;

        container.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
            if (container && container.childElementCount === 0) container.remove();
        }, durationMs);
    }

    function resetFormularioResenha() {
        input.value = '';
        tipoSelect.value = 'Personal';
        ratingSelect.value = '5';
    }

    function limpiarTexto(texto) {
        return String(texto).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function normalizarMensaje(texto) {
        const limpio = String(texto).trim().replace(/\s+/g, ' ').toLowerCase();
        if (!limpio) return '';
        return limpio.charAt(0).toUpperCase() + limpio.slice(1);
    }

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

    function guardarYActualizar() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(misResenhas));
        pintarTarjetas();
    }

    /**
     * pinta las reseñas en el contenedor `lista` de forma eficiente y segura.
     * 
     * Problemas de rendimiento de la versión original:
     * 1. Usa `lista.innerHTML = ''` y luego inserta los elementos **uno a uno** con `appendChild`, lo que causa múltiples repaints y reflows del DOM.
     * 2. Dentro del ciclo forEach, para cada reseña crea elementos y modifica el DOM individualmente.
     * 3. Usa `innerHTML` para todos los nodos, lo cual puede exponer a vulnerabilidades XSS si los datos no están sanizados y es más lento que la inserción masiva controlada.
     * 
     * Pasos para una versión más eficiente:
     * 1. Construir todo el HTML en memoria (usando array y join) en vez de manipular el DOM en cada ciclo.
     * 2. Usar un solo reemplazo de `innerHTML` al final, reduciendo repaints y reflows.
     * 3. Sanear siempre el texto del usuario antes de imprimirlo.
     * 
     * Nota: Si se requieren elementos dinámicos (como botones con manejadores), es mejor usar delegación de eventos.
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
            const { texto, tipo, rating } = resenha;

            const node = resenhaTemplate.content.firstElementChild.cloneNode(true);
            node.className = `${LI_BASE_CLASS} resenha-item flex`;

            const tipoEl = node.querySelector('[data-role="tipo"]');
            const estrellasEl = node.querySelector('[data-role="estrellas"]');
            const textoEl = node.querySelector('[data-role="texto"]');
            const eliminarBtn = node.querySelector('[data-role="eliminar"]');

            tipoEl.className = `inline-flex items-center px-2 py-0.5 rounded-full ${claseParaTipo(tipo)}`;
            tipoEl.textContent = tipo;

            estrellasEl.textContent = estrellasParaRating(rating);
            estrellasEl.setAttribute('aria-label', `Puntuación ${rating} de 5`);

            // Seguridad: nunca insertamos el texto del usuario con innerHTML
            textoEl.textContent = normalizarMensaje(texto);

            eliminarBtn.dataset.idx = String(idx);
            eliminarBtn.setAttribute('aria-label', labelEliminarParaResenha({ texto, tipo, rating }));

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
            lista._eventsDelegated = true;
        }
    }

    pintarTarjetas();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const mensaje = limpiarTexto(normalizarMensaje(input.value));
        if (!mensaje) return;

        const tipo = tipoSelect.value;
        const rating = Number(ratingSelect.value) || 5;
        if (esResenhaRepetida(mensaje, tipo, rating)) {
            alert('Esa reseña ya ha sido publicada');
            return;
        }

        misResenhas.push({ texto: mensaje, tipo, rating });
        resetFormularioResenha();
        guardarYActualizar();
    });

    window.borrarResenha = (indice) => {
        misResenhas.splice(indice, 1);
        guardarYActualizar();
        mostrarAviso({
            accion: 'borrarResenha',
            mensaje: 'Su mensaje ha sido eliminado correctamente',
            durationMs: 5000,
        });
    };

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