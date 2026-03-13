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
    const themeBtn = document.getElementById('theme-toggle');

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

    function resetFormularioResenha() {
        input.value = '';
        tipoSelect.value = 'Personal';
        ratingSelect.value = '5';
    }

    function limpiarTexto(texto) {
        return String(texto).replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

    function pintarTarjetas() {
        lista.innerHTML = '';
        if (misResenhas.length === 0) {
            lista.style.columnCount = 1;
            lista.innerHTML = `<li class="col-span-full w-full text-center text-gray-400 py-8 text-lg font-medium flex flex-col items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" class="w-10 h-10 text-slate-400 mx-auto"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 8l4 4M7.6 25.1c-.6.1-1.1-.4-1-1l.6-3.1c.1-.4.2-.7.5-1l13.3-13.3c.8-.8 2-.8 2.8 0l2.1 2.1c.8.8.8 2 0 2.8L12.6 25.1c-.3.3-.6.5-1 .6l-3 .6z"/></svg>
                Aún no hay reseñas. ¡Sé el primero en escribir una!
            </li>`;
            return;
        }
        lista.style.removeProperty('column-count');
        misResenhas.forEach((resenha, idx) => {
            const { texto, tipo, rating } = resenha;
            const tipoClase = claseParaTipo(tipo);
            const estrellas = estrellasParaRating(rating);
            const li = document.createElement('li');
            li.className = LI_BASE_CLASS;
            li.innerHTML = `
                <div class="flex flex-col gap-2 pr-4 max-w-[80%]">
                    <div class="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide font-semibold">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full ${tipoClase}">${tipo}</span>
                        <span aria-label="Puntuación ${rating} de 5" class="text-yellow-400 dark:text-yellow-300 select-none">${estrellas}</span>
                    </div>
                    <span class="text-[#333] dark:text-gray-100 text-[15px] leading-relaxed font-medium break-words">${texto}</span>
                </div>
                <button class="bg-slate-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-slate-600 transition-all hover:scale-105 active:scale-95 shadow-sm" onclick="borrarResenha(${idx})">Eliminar</button>`;
            lista.appendChild(li);
        });
    }

    pintarTarjetas();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const mensaje = limpiarTexto(input.value.trim());
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