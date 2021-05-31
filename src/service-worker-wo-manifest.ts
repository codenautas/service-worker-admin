"use strict";

// TEMPLATE-START
var version:string = '/*version*/';
var appName:string = '/*appName*/';
var urlsToCache:string[] = [/*urlsToCache*/];
var fallback:{path:string, fallback:string, withoutCache?:boolean}[] = [/*fallbacks*/];
var onTheFlyCacher = /#CACHE$/;
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

type Message={type:'caching', url:string, error:Error|null} | {type:'log', text:string}

function broadcastMessage(message:Message){
    self.clients.matchAll({includeUncontrolled: true}).then(clients => {
        for (const client of clients) client.postMessage(message);
    });
}

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
            var message:Message = {type:'caching', url:urlToCache, error};
            broadcastMessage(message);
            if(error) throw error;
        })).then(function(){
            self.skipWaiting();
            console.log("fin instalando");
        })
    ));
    // idea de informar error: https://stackoverflow.com/questions/62909289/how-do-i-handle-a-rejected-promise-in-a-service-worker-install-event
});

var specialSources:{[key:string]:()=>Promise<any>|any}={
    "@version": ()=>version,
    "@CACHE_NAME": ()=>CACHE_NAME,
    "@urlsToCache": ()=>urlsToCache.map(r=>{var u = new URL(new Request(r).url); return u.pathname + u.search;}),
    "@fallback": ()=>JSON.stringify(fallback)
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
                cache.match(event.request).then(async (response)=>{
                    return response || ( 
                        event.request.url.match(onTheFlyCacher) && await cache.add(event.request)
                    ) || fetch(event.request).catch(async (err)=>{
                        console.log(err)
                        console.log("request: ", event.request)
                        var fallbackResult = fallback.find((aFallback)=>aFallback.path.includes(source))
                        if(fallbackResult){
                            return cache.match(fallbackResult.fallback).then((response)=>{
                                if(response){
                                    console.log("respuesta fallback: ", response)
                                    return response
                                }else{
                                    throw err
                                }
                            })
                        }
                        throw err
                    });
                })
            )
        );
    }
});

self.addEventListener('activate', (evt)=>{
    // @ts-expect-error Esperando que agregen el listener de 'fetch' en el sistema de tipos
    var event:FetchEvent = evt;
    console.log("recuperando urls que coincidan con onTheFlyCacher y borrando caches viejas")
    event.waitUntil(
        caches.keys().then(async (cacheNames)=>{
            await  Promise.all(
                cacheNames.filter((cacheName)=>
                    cacheName != CACHE_NAME
                ).map(async(cacheName)=>{
                    //pedirle las urls que coincidan onTheFlyCacher
                    let cache = await caches.open(cacheName);
                    let keys = await cache.keys();
                    for(var estructuraKey of keys.filter((key)=>key.url.match(onTheFlyCacher))){
                        console.log('recuperando estructura ', estructuraKey.url)
                        await caches.open(CACHE_NAME).then(async (cache) => await cache.add(estructuraKey.url));
                    } 
                    console.log("borrando cache ", cacheName);
                    return caches.delete(cacheName);
                })
            );
            console.log("fin borrando caches viejas")
        })
    );
});

self.addEventListener('message', function(evt) {
    console.log("mensaje: ", evt.data)
    if(evt.data=='skipWaiting'){
        self.skipWaiting().then(()=>console.log(version));
    }
});