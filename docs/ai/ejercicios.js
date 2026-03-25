function saludo(hora){
    if(hora >= 6 && hora<=12){
        console.log("Buenos dias")
    }else if(hora >=13 && hora<=20){
        console.log("Buenas tardes")
    }else {
        console.log("Buenas noches")
    }
}
saludo(22);

function validarContrasenhas(contrasenha){

    let contador = contrasenha.split("");
    let numeros = ["1","2","3","4","5","6","7","8","9"];
    let contienenumero= false;
    for (let i=0; i<contrasenha.length; i++){

        if(numeros.includes(contrasenha[i])){
            contienenumero = true;
        }
    }

    if (contienenumero == false){
        console.log("Deberia tener al menos un número")
    }

    if(contrasenha.length >=8){
        console.log("Tiene buena seguridad")
    }else{
        console.log("Más largo, para más seguridad")
    }
}
validarContrasenhas("holawvvnwovn233");
