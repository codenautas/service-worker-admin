"use strict";

// TEMPLATE-START
var version:string = '/*version*/';
var appName:string = '/*appName*/';
var urlsToCache:string[] = [/*urlsToCache*/];
// TEMPLATE-END

var CACHE_NAME:string = appName+':'+version;
var urlsCached:string[]

// Esperando https://github.com/microsoft/TypeScript/issues/11781
interface WindowOrWorkerGlobalScope{
    skipWaiting():Promise<void>
    clients:{
        get(clientId:FetchEvent['clientId']):Promise<Client>
        matchAll(query:any):Promise<Client[]>
    }
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
// Fin de la espera?

self.addEventListener('install', async (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    //si hay cambios no espero para cambiarlo
    // self.skipWaiting();
    console.log("instalando")

    event.waitUntil(caches.open(CACHE_NAME).then((cache)=>
        Promise.all(urlsToCache.map(async urlToCache=>{
            var error:Error|null=null;
            try{
                await cache.add(urlToCache)
            }catch(err){
                error=err;
            }
            var message = {type:'caching', url:urlToCache, error};
            self.clients.matchAll({includeUncontrolled: true}).then(clients => {
                for (const client of clients) client.postMessage(message);
            });
            if(error) throw error;
        }))
    ));
    // idea de informar error: https://stackoverflow.com/questions/62909289/how-do-i-handle-a-rejected-promise-in-a-service-worker-install-event
});

var specialSources:{[key:string]:()=>Promise<any>|any}={
    "@version": ()=>version,
    "@CACHE_NAME": ()=>CACHE_NAME,
    "@urlsToCache": ()=>urlsToCache.map(r=>{var u = new URL(new Request(r).url); return u.pathname + u.search;})
}

self.addEventListener('fetch', async (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    var sourceParts = event.request.url.split('/');
    var source:string = sourceParts[sourceParts.length-1];
    console.log("source",source)
    if(source in specialSources){
        var value = await specialSources[source]();
        var miBlob = new Blob([JSON.stringify(value)], {type : "application/json"});
        var opciones = { "status" : 200 , "statusText": typeof value === "string"?value:"@json", ok:true };
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