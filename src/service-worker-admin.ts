"use strict";

class ServiceWorkerAdmin{
    private options:Partial<ServiceWorkerAdmin.Options>={};
    private currentRegistration:ServiceWorkerRegistration|null = null;
    constructor(){
    }
    async installIfIsNotInstalled(opts: ServiceWorkerAdmin.Options):Promise<void>{
      try{
        this.options = opts;
        if('serviceWorker' in navigator){
            var reg = await navigator.serviceWorker.register(
                `sw-manifest.js`
            );
            var handleNewVersion = async ()=>{
                this.options?.onNewVersionAvailable?.(async ()=>{
                    this.options?.onReadyToStart?.(true);
                    await this.currentRegistration?.waiting?.postMessage('skipWaiting');
                })
            }
            this.options.onInfoMessage?.('Registrado:'+!!reg.active+','+!!reg.installing+','+!!reg.waiting+','+reg.active?.state+','+reg.installing?.state+','+reg.waiting?.state);
            console.log('Registered:', reg);
            this.currentRegistration = reg;
            //updatefound is fired if service-worker.js changes.
            reg.onupdatefound = ()=>{
                this.options.onInfoMessage?.('Instalando');
                // The updatefound event implies that reg.installing is set; see
                // https://w3c.github.io/ServiceWorker/#service-worker-registration-updatefound-event
                // @ts-ignore si estoy en onpudatefound es porque existe reg.installing
                var installingWorker:ServiceWorker = reg.installing;
                installingWorker.onstatechange = ()=>{
                    this.options.onInfoMessage?.(installingWorker.state);
                    console.log("estado: ", installingWorker.state);
                    switch (installingWorker.state) {
                        case 'installed':
                            if (navigator.serviceWorker.controller) {
                                // At this point, the old content will have been purged and the fresh content will
                                // have been added to the cache.
                                // It's the perfect time to display a "New content is available; please refresh."
                                // message in the page's interface.
                                console.log('New or updated content is available.');
                                handleNewVersion();
                            } else {
                                // At this point, everything has been precached.
                                // It's the perfect time to display a "Content is cached for offline use." message.
                                console.log('Content is now available offline!');
                            }
                            //setMessage(`Aplicación actualizada, por favor refresque la pantalla`,'all-ok');
                        break;
                        case 'activated':
                            //setMessage(`Aplicación actualizada, espere a que se refresque la pantalla`,'all-ok');
                            setTimeout(async ()=>{
                                this.options.onInfoMessage?.('INSTALADO DEBE REINICIAR');
                                await this.options?.onJustInstalled?.(()=>{
                                    location.reload()
                                })
                            },1000)
                        break;
                        case 'redundant':
                            this.options?.onError?.(new Error('redundant'), 'redundant installing')
                            console.error(new Error('redundant'), 'redundant installing');
                        break;
                        default:
                            this.options.onInfoMessage?.('other:'+installingWorker.state);
                    }
                };
                installingWorker.onerror=(evErr)=>{
                    this.options?.onError?.(evErr.error, 'installingWorker')
                    console.error(evErr.error, 'installingWorker');
                }
            };
            navigator.serviceWorker.onmessage=async (evMss)=>{
                if(evMss.data instanceof Error){
                    this.options?.onError?.(evMss.data, 'from serviceWorker');
                }else{
                    if(evMss.data.type === 'caching'){
                        await this.options?.onEachFile?.(evMss.data.url, evMss.data.error);
                        if(evMss.data.error){
                            await this.options?.onError?.(evMss.data.error, 'caching '+evMss.data.url);
                        }
                    }
                }
                console.error(evMss.data, 'from serviceWorker');
            }
            if(!!reg.waiting && reg.active){
                handleNewVersion();
            }
            this.options?.onReadyToStart?.(!reg.active);
            this.localResourceControl(3);
        }else{
            console.log('serviceWorkers no soportados')
            // acá hay que elegir cómo dar el error:
            // this.options.onError?.(new Error('serviceWorkers no soportados'));
            throw Error ('serviceWorkers no soportados');
        }
      }catch(err){
        this.options?.onError?.(err, 'installing');
      }
    }
    async localResourceControl(retrys:number){
        var urlsToCache:string[] = await this.getSW("urlsToCache");
        if(!(urlsToCache instanceof Array)){
            if(retrys){
                return new Promise((resolve, reject)=>{
                    setTimeout(()=>{
                        this.localResourceControl(retrys-1).then(resolve, reject)
                    },1000)
                });
            }else{
                this.options?.onError?.(new Error(`Manifest cache "${urlsToCache}"`), 'initializing service-worker')
            }
            return;
        }
        [   
            {obj:document.scripts    , prop:'src' },
            {obj:document.images     , prop:'src' },
            {obj:document.styleSheets, prop:'href'},
        ].forEach(def=>{
            Array.prototype.forEach.call(def.obj, node=>{
                var path = node[def.prop];
                if(path){
                    var query;
                    try{
                        var url = new URL(path);
                        query = url.pathname + url.search;
                        if(!urlsToCache.includes(query)){
                            throw new Error('is not in manifest');
                        }
                    }catch(err){
                        this.options?.onError?.(new Error(`Resource "${query}" ${err.message}`), 'initializing service-worker')
                    }
                }
            })
        })
    }
    async getSW(variable:string){
        let response = await fetch("@"+variable);
        let varResult = response.statusText;
        if(varResult === "@json"){
            return response.json()
        }
        return varResult
    }
    async uninstall(){
        var CACHE_NAME = await this.getSW("CACHE_NAME")
        await this.currentRegistration?.unregister();
        if(CACHE_NAME){
            await caches.delete(CACHE_NAME);
        }
    }
    async check4newVersion():Promise<void>{
        // var reg = 
        await this.currentRegistration?.update()
        // return reg!=null && (!!reg.waiting || !!reg.installing);
    }
}

namespace ServiceWorkerAdmin{
    export type Options = {
        // Se llaman varias veces
        onInfoMessage:(message?:string)=>void
        onEachFile:(url:string, error:Error)=>void
        onError:(err:Error, contexto:string)=>void
        onReadyToStart:(installing:boolean)=>void // Muestra la pantalla de instalando o la pantalla principal de la aplicación
        onJustInstalled:(run:()=>void)=>void // para mostra "fin de la instalación y poner el botón "entrar"=>run()
            // run hace reload
        onNewVersionAvailable:(install:()=>void)=>void // para mostrar "hay una nuevar versión" y poner el botón "instalar"=>run
            // install hace skipWaiting <-> llama a onInstalling()
    }
}

console.log('va global')

// @ts-ignore esto es para web:
window.ServiceWorkerAdmin = ServiceWorkerAdmin;

export = ServiceWorkerAdmin;