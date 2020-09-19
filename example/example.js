"use strict";
//import {ServiceWorkerAdmin} from "../dist/service-worker-admin";
var ServiceWorkerAdmin=require("../dist/service-worker-admin.js").ServiceWorkerAdmin;

function console_log(message, obj){
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(message));
    div.appendChild(document.createTextNode(JSON.stringify(obj)));
    document.getElementById('console').appendChild(div);
}

window.onload=function(){
    var options={
        onEachFile: (f)=>console_log('file: ',f),
        onStartLoading: ()=>console_log('starting download'),
        onError: (err)=>console_log('on error', err),
        onNewVersionAvailable: (version)=>console_log('new version available: ', version)
    }
    var swa = new ServiceWorkerAdmin(options)
    //swa.installFrom('./example-for-cache.json')
    console.log("swa ", swa)
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