"use strict";

// Esperando https://github.com/microsoft/TypeScript/issues/11781
interface WindowOrWorkerGlobalScope{
    skipWaiting():void
}
interface FetchEvent extends Event{
    request:Request
    respondWith(promise:Promise<Response>|Response):void
    waitUntil(promise:Promise<any>):void
}

const CACHE_NAME = '#20-09-16'; //BUSCAR
const FALLBACK = '/eseco/campo'; //BUSCAR

self.addEventListener('install', async (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    //si hay cambios no espero para cambiarlo
    self.skipWaiting();
    console.log("instalando")
    var params = new URLSearchParams(location.search);
    var manifestPath:string = params.get('manifestPath')!;
    var CACHE_NAME:string = params.get('appName')!;
    var req = await fetch(manifestPath);
    var manifestJson = await req.json();
    var urlsToCache:string[] = manifestJson.cache;
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache)=>
            cache.addAll(urlsToCache)
        )
    );
});

self.addEventListener('fetch', (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    var sourceParts = event.request.url.split('/');
    var source:string = sourceParts[sourceParts.length-1];
    console.log("source",source)
    if(source=='@version'){
        var miBlob = new Blob();
        var opciones = { "status" : 200 , "statusText" : CACHE_NAME, ok:true };
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
                    }).catch((err)=>{
                        console.log(err)
                        return new Response(`<p>Se produjo un error al intentar cargar la p&aacute;gina, es posible que no haya conexi&oacute;n a internet</p><a href=${FALLBACK}>Volver a Hoja de Ruta</button>`, {
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