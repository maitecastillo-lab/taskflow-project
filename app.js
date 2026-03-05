document.addEventListener('DOMContentLoaded', () => {

    /*Importamos los id*/ 
    const form = document.getElementById('resenha');
    const input = document.getElementById('texto');
    const lista = document.getElementById('listapubli');

    /*Creamos el array para que guarde todo */
    let misResenhas = JSON.parse(localStorage.getItem('mis_resenhas')) || [];

    /*ahora pintamos las reseñas que ya estaban al abrir la web */
    pintarTarjetas();

    /*ahora vamos detectar cada vez que le den a publicar */
    form.addEventListener('submit', (evento) => {

        /*hacemos que la web no se refresque entera al enviar la recomendación*/
        evento.preventDefault();

        /*guardamos lo escriben en una caja la cual llamaremos mensaje */
        const mensaje = input.value.trim();

        /*detectamos si el usuario escribio algo, si solo puso un espacio pues no lo lee*/
        if(mensaje!==""){
            /*si lo que escribio es algo  mas que espacio blanco, guardaremos en el array */
            misResenhas.push(mensaje);

            /*aqui dejaremos sin nada el cuadro de texto para la siguiente persona que ponga algo */
            input.value='';

            /*guardamos la nueva lista y volvemos a pintar */
            guardarYActualizar();
        }
    });

    /*aqui pintamos las tajetas en la pagina */
    function pintarTarjetas(){
        lista.innerHTML =''; /*limpiamos la lista para no duplicar */
        misResenhas.forEach((frase, posicion) => {
            const li = document.createElement('li');
            li.className = 'resenha-item';

            li.innerHTML = `
            <span>${frase}</span>
            <button class="btn-borrar" onclick = "borrarResenha(${posicion})">Eliminar</button> 
            `;
            lista.appendChild(li);

        });
    }
    /*guardamos en el local storage */
    function guardarYActualizar(){
        localStorage.setItem('mis_resenhas', JSON.stringify(misResenhas));
        pintarTarjetas();
    }
    /*funcion para borrar cuando quiera */
    window.borrarResenha =(indice)=>{
        /*quitamos el elemento del array*/
        misResenhas.splice(indice,1);
        /*y actualizamos */
        guardarYActualizar();
    }

    const buscador = document.getElementById('buscador');

    buscador.addEventListener('input', () => {
        // se guarda lo que el usuario escribe
        const filtro = buscador.value.toLowerCase();
        
        // seleccionamos todas las tarjetas que existen en ese momento
        const tarjetas = document.querySelectorAll('.resenha-item');

        tarjetas.forEach(tarjeta => {
            // buscamos el texto que hay dentro del span de cada tarjeta
            const textoResenha = tarjeta.querySelector('span').textContent.toLowerCase();

            // aqui vemos si el texto incluye lo que hemos escrito, se queda. Si no, se oculta.
            if (textoResenha.includes(filtro)) {
                tarjeta.style.display = "flex"; // Usamos flex para que no pierda tu diseño
            } else {
                tarjeta.style.display = "none"; // Desaparece
            }
        });
    });
});