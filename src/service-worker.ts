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

self.addEventListener('install', async (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    //si hay cambios no espero para cambiarlo
    // self.skipWaiting();
    console.log("instalando")
    var params = new URLSearchParams(location.search);
    var CACHE_NAME:string = params.get('appName')!;
    var manifestPath:string = params.get('manifestPath')!;
    event.waitUntil((async ()=>{
        var req = await fetch(manifestPath);
        var manifestJson = await req.json();
        var urlsToCache:string[] = manifestJson.cache;
        await caches.open(CACHE_NAME).then((cache)=>
            cache.addAll(urlsToCache)
        )
    })());
});

self.addEventListener('fetch', (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    var params = new URLSearchParams(location.search);
    var CACHE_NAME:string = params.get('appName')!;
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
    var params = new URLSearchParams(location.search);
    var CACHE_NAME:string = params.get('appName')!;
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