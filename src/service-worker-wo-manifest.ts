"use strict";

// TEMPLATE-START
var version:string = '/*version*/';
var appName:string = '/*appName*/';
var urlsToCache:string[] = [/*urlsToCache*/];
// TEMPLATE-END

var CACHE_NAME:string = appName+':'+version;

// Esperando https://github.com/microsoft/TypeScript/issues/11781
interface WindowOrWorkerGlobalScope{
    skipWaiting():Promise<void>
    clients:{get(clientId:FetchEvent['clientId']):Promise<Client>}
}

interface Client{
    postMessage(message:any):void
}
interface FetchEvent extends Event{
    clientId:'clientId'|'etc...'
    request:Request
    respondWith(promise:Promise<Response>|Response):void
    waitUntil(promise:Promise<any>):void
}

self.addEventListener('install', async (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    //si hay cambios no espero para cambiarlo
    // self.skipWaiting();
    console.log("instalando")
    event.waitUntil(caches.open(CACHE_NAME).then((cache)=>
        cache.addAll(urlsToCache)
    ));
    // idea de informar error: https://stackoverflow.com/questions/62909289/how-do-i-handle-a-rejected-promise-in-a-service-worker-install-event
});

var specialSources:{[key:string]:()=>string}={
    "@version": ()=>version,
    "@CACHE_NAME": ()=>CACHE_NAME,
}

self.addEventListener('fetch', async (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    var sourceParts = event.request.url.split('/');
    var source:string = sourceParts[sourceParts.length-1];
    console.log("source",source)
    if(source in specialSources){
        var miBlob = new Blob();
        var opciones = { "status" : 200 , "statusText" : specialSources[source](), ok:true };
        var miRespuesta = new Response(miBlob,opciones);
        event.respondWith(miRespuesta);
    }else{
        event.respondWith(
            caches.open(CACHE_NAME).then((cache)=>
                cache.match(event.request).then((response)=>{
                    console.log("respuesta caché: ", response)
                    return response || fetch(event.request).then((response)=>{
                        console.log("respuesta", response)
                        if(!response) {
                            console.log("no tiene respuesta")
                            throw Error('without response');
                        }
                        return response;
                    }).catch(async (err)=>{
                        console.log(err)
                        var client = await self.clients.get(event.clientId);
                        client.postMessage(err);
                        return new Response(`<p>Se produjo un error al intentar cargar la p&aacute;gina, es posible que no haya conexi&oacute;n a internet</p><a href='/'>Volver a Hoja de Ruta</button>`, {
                            headers: {'Content-Type': 'text/html'}
                        });
                    });
                })
            )
        );
    }
});

self.addEventListener('activate', (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    console.log("borrando caches viejas")
    event.waitUntil(
        caches.keys().then((cacheNames)=>{
            return Promise.all(
                cacheNames.filter((cacheName)=>
                    cacheName != CACHE_NAME
                ).map((cacheName)=>{
                    console.log("borrando cache ", cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('message', function(evt) {
    console.log("mensaje: ", evt.data)
    if(evt.data=='skipWaiting'){
        self.skipWaiting().then(()=>console.log(version));
    }
});