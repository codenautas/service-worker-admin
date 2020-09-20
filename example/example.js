"use strict";
var ServiceWorkerAdmin=require("./service-worker-admin.js").ServiceWorkerAdmin;

function console_log(message, obj){
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(message));
    if(obj!=null){
        div.appendChild(document.createTextNode(JSON.stringify(obj)));
    }
    document.getElementById('console').appendChild(div);
}

window.onload=async function(){
    var options={
        onEachFile: (f)=>console_log('file: ',f),
        onInfoMessage: (m)=>console_log('sw:', m),
        onError: (err)=>console_log('on error', err),
        onNewVersionAvailable: (version)=>console_log('new version available: ', version)
    }
    var swa = new ServiceWorkerAdmin()
    swa.setOptions(options);
    var instalado = await swa.installFrom('./example-for-cache.json','example');
    document.getElementById('cargando').style.display='none';
    if(!instalado.isActive){
        document.getElementById('instalando').style.display='block';
        //var p = instalado.ready();
        //return;
    }
    await instalado.ready();
    document.getElementById('instalando').style.display='none';
    document.getElementById('instalado').style.display='block';
    document.getElementById('calcular').addEventListener('click',function(){
        var visor = document.getElementById('visor');
        var calculo = visor.value;
        var resultado;
        var color;
        try{
            resultado = new Function('return '+calculo)();
            color='blue';
        }catch(err){
            resultado = err.message;
            color='red';
        }
        var div=document.createElement('div');
        div.color=color;
        div.appendChild(document.createTextNode(calculo))
        div.appendChild(document.createTextNode(' ⇨ '))
        div.appendChild(document.createTextNode(resultado))
        document.getElementById('history').appendChild(div);
    })

}