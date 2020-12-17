"use strict";

function instalarReloj(){
    var ID='el-reloj';
    var elemento = document.getElementById(ID);
    if(!elemento){
        elemento = document.createElement('div');
        elemento.id=ID;
        document.body.appendChild(elemento);
    }
    elemento.textContent='ARRANCA';
    setInterval(()=>{
        elemento!.textContent = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
    },1000)
}

window.addEventListener('load', instalarReloj);