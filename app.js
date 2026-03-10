document.addEventListener('DOMContentLoaded', () => {

    /* Importamos los id */ 
    const form = document.getElementById('resenha');
    const input = document.getElementById('texto');
    const lista = document.getElementById('listapubli');
    const themeBtn = document.getElementById('theme-toggle');

    /* Estado inicial accesible del botón de tema */
    themeBtn.setAttribute('aria-pressed', document.documentElement.classList.contains('dark'));

    /*Alternar Modo Oscuro en el elemento raíz y actualizar aria-pressed */
    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        themeBtn.setAttribute('aria-pressed', isDark);
    });

     /* Creamos el array para que guarde todo */
    let misResenhas = JSON.parse(localStorage.getItem('mis_resenhas')) || [];

    /* Pintamos las reseñas iniciales */
    pintarTarjetas();

    /* Detectamos cada vez que le den a publicar */
     form.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const mensaje = input.value.trim();

        if(mensaje !== ""){
            misResenhas.push(mensaje);
            input.value = '';
            guardarYActualizar();
        }
    });

    /* 2. Sustitución de CSS por clases de utilidad de Tailwind */
    // Renderiza las reseñas almacenadas en la lista usando destructuring
    function pintarTarjetas() {
        lista.innerHTML = '';
        misResenhas.forEach((frase, posicion) => {
            const [texto, idx] = [frase, posicion];
            const li = document.createElement('li');
            li.className = 'resenha-item bg-white dark:bg-slate-800 p-5 mb-5 rounded-[12px] border-l-[6px] border-l-slate-400 shadow-md flex justify-between items-center break-inside-avoid w-full transición-transform hover:translate-x-1';
            li.innerHTML = `
                <span class="text-[#333] dark:text-gray-100 text-[15px] leading-relaxed pr-4 font-medium">${texto}</span>
                <button class="bg-slate-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-slate-600 transition-all hover:scale-105 active:scale-95 shadow-sm" onclick="borrarResenha(${idx})">Eliminar</button>`;
            lista.appendChild(li);
        });
    }

     /* Guardamos en el local storage */
    function guardarYActualizar(){
        localStorage.setItem('mis_resenhas', JSON.stringify(misResenhas));
        pintarTarjetas();
    }

    /* Función para borrar (global para que el onclick la encuentre) */
    window.borrarResenha = (indice) => {
        misResenhas.splice(indice, 1);
        guardarYActualizar();
     }

    /* Lógica del Buscador adaptada a Tailwind */
    const buscador = document.getElementById('buscador');

    buscador.addEventListener('input', () => {
        const filtro = buscador.value.toLowerCase();
        const tarjetas = document.querySelectorAll('.resenha-item');

        tarjetas.forEach(tarjeta => {
            const textoResenha = tarjeta.querySelector('span').textContent.toLowerCase();

            // Usamos clases 'hidden' y 'flex' de Tailwind para ocultar/mostrar
             if (textoResenha.includes(filtro)) {
                tarjeta.classList.remove('hidden');
                tarjeta.classList.add('flex');
            } else {
                tarjeta.classList.remove('flex');
                tarjeta.classList.add('hidden');
            }
        });
     });
}); 