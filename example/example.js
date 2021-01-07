"use strict";
var ServiceWorkerAdmin=require("./service-worker-admin.js");

function console_log(message, obj, id){
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(message));
    if(obj!=null){
        if(obj instanceof Error){
            div.appendChild(document.createTextNode(obj.message));
            div.style.color='red';
        }else{
            div.appendChild(document.createTextNode(JSON.stringify(obj)));
        }
    }
    document.getElementById(id||'console').appendChild(div);
}

function mostrarEstadoLogin(){
    var lasCookies = {};
    (document.cookie||'').split(';').map(function(pair){
        var igual=pair.indexOf('=');
        lasCookies[pair.substr(0,igual).trim()]=pair.substr(igual+1).trim();
    })
    console.log('lasCookies',lasCookies);
    var elemento=document.getElementById('estado_login');
    if(lasCookies.login=='S'){
        elemento.textContent='logged ✔️';
        elemento.href='/login-change?state=N';
    }else{
        elemento.textContent='UNLOGGED'
        elemento.href='/login-change?state=S';
    }
}

async function traerLoginTime(){
    var req = await fetch('/login-time');
    var text = await req.text();
    var elemento = document.getElementById('login_time');
    elemento.textContent=text;
}

window.onload=async function(){
    var options={
        onNewVersionAvailable: (version)=>console_log('new version available: ', version)
    }
    var swa = new ServiceWorkerAdmin()
    document.getElementById('cargando').style.display='none';
    swa.installIfIsNotInstalled({
        serviceWorkerFilename:'swa-manifest.js',
        onEachFile: (url, error)=>{
            console_log('file: ',url);
            console_log(url, error, 'archivos')
        },
        onInfoMessage: (m)=>console_log('message: ', m),
        onError: (err, context)=>{
            console_log('error: '+(context?` en (${context})`:''), err);
            console_log(context, err, 'error-console')
        },
        onJustInstalled:async (run)=>{
            document.getElementById('arrancar').style.display='';
            document.getElementById('arrancar').onclick=()=>{
                run()
            }
        },
        onReadyToStart:startCalculator,
        onNewVersionAvailable:(install)=>{
            document.getElementById('nueva-version-detectada').style.display='';
            document.getElementById('actualizar').onclick=()=>{
                install();
            }
        }
    });
    async function startCalculator(installing){
        if(installing){
            document.getElementById('instalado').style.display='none';
            document.getElementById('instalando').style.display='block';
            return;
        }
        document.getElementById('instalando').style.display='none';
        document.getElementById('instalado').style.display='block';
        document.getElementById('buscar-version-nueva').style.display='block';
        document.getElementById('version').textContent=await swa.getSW('version');
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
                resultado = fun(...Object.keys(resultados).map(f=>resultados[f]));
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
            div.appendChild(nodoClickeable(JSON.stringify(resultado)))
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
        document.getElementById('buscar-version').addEventListener('click',async ()=>{
            // var existsNewVersion = 
            await swa.check4newVersion();
            /*
            document.getElementById('buscar-version').style.display=existsNewVersion?"none":"";
            document.getElementById('resultado-buscar-version').textContent=existsNewVersion?
                ""
            :
                "la aplicación se encuentra actualizada";
            */
        })
        var botonAgregarReloj=document.getElementById('agregar_reloj');
        botonAgregarReloj.addEventListener('click',async ()=>{
            botonAgregarReloj.disabled=true;
            var script = document.createElement('script');
            script.src='reloj.js';
            document.body.appendChild(script);
            script.onload=()=>{
                instalarReloj();
            };
            script.onerror=(err)=>{
                console.log(err);
                instalarReloj();
                botonAgregarReloj.textContent=err.message||err;
            }
        });
        traerLoginTime();
    }
    mostrarEstadoLogin();
    traerLoginTime();
}
