"use strict";
var ServiceWorkerAdmin=require("./service-worker-admin.js").ServiceWorkerAdmin;

function console_log(message, obj){
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(message));
    if(obj!=null){
        if(obj instanceof Error){
            div.appendChild(document.createTextNode(obj.message));
        }else{
            div.appendChild(document.createTextNode(JSON.stringify(obj)));
        }
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
        await instalado.ready();
        document.getElementById('arrancar').style.display='';
        document.getElementById('arrancar').onclick=()=>{
            location.reload();
        }
    }else{
        document.getElementById('instalando').style.display='none';
        document.getElementById('instalado').style.display='block';
        var visor = document.getElementById('visor');
        var iNodo=0;
        var resultados={}
        var nodoClickeable=function(texto){
            var nodo = document.createElement('span')
            nodo.className='nodo-clickeable';
            nodo.textContent=texto;
            nodo.onclick=()=>{
                visor.value=visor.value+texto;
            }
            return nodo;
        }
        var calculate=function(){
            var calculo = visor.value;
            var resultado;
            var color;
            try{
                var fun = new Function(...Object.keys(resultados),'return '+calculo)
                console.log('fun',fun)
                resultado = JSON.stringify(fun(...Object.keys(resultados).map(f=>resultados[f])));
                color='blue';
            }catch(err){
                resultado = err.message;
                color='red';
            }
            var div=document.createElement('div');
            div.color=color;
            iNodo++;
            var nNodo=`$${iNodo}`;
            resultados[nNodo]=resultado;
            div.appendChild(nodoClickeable(nNodo));
            div.appendChild(document.createTextNode(' ⇐ '))
            div.appendChild(nodoClickeable(calculo))
            div.appendChild(document.createTextNode(' ⇨ '))
            div.appendChild(nodoClickeable(resultado))
            var history = document.getElementById('history')
            history.insertBefore(div,history.children[0]);
        }
        document.getElementById('calcular').addEventListener('click',calculate)
        document.getElementById('visor').addEventListener('keypress',
            /** @param {KeyboardEvent} event */
            (event)=>{
                if(event.key=="Enter" && !event.shiftKey){
                    calculate()
                }
            }
        )
        document.getElementById('desinstalar').addEventListener('click',()=>{
            document.getElementById('confirmar-desinstalar').style.display='';
        })
        document.getElementById('confirmar-desinstalar').addEventListener('click',async ()=>{
            document.getElementById('confirmar-desinstalar').enabled=false
            document.getElementById('confirmar-desinstalar').textContent='desinstalando'
            await swa.uninstall()
            document.getElementById('confirmar-desinstalar').textContent='¡DESINSTALADO!'
            
        })
    }
}