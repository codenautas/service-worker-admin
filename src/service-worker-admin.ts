"use strict";

export type Options={
    // Se llaman varias veces
    onInfoMessage:(message?:string)=>void
    onEachFile:()=>void
    onError:(err:Error)=>void
    // Se llaman una sola vez como máximo c/u
    onInstalling:()=>void // para poner el cartel "instalando" (y apagar la aplicación si está encendida)
    onJustInstalled:(run:()=>void)=>void // para mostra "fin de la instalación y poner el botón "entrar"=>run()
        // run hace reload
    onActive:()=>void  // para mostrar la aplicación
    onNewVersionAvailable:(install:()=>void)=>void // para mostrar "hay una nuevar versión" y poner el botón "instalar"=>run
        // install hace skipWaiting <-> llama a onInstalling()
}

export class ServiceWorkerAdmin{
    private options:Partial<Options>={};
    private currentRegistration:ServiceWorkerRegistration|null = null;
    constructor(){
    }
    async installIfIsNotInstalled(opts: Options):Promise<void>{
        this.options = opts;
        if('serviceWorker' in navigator){
            var reg = await navigator.serviceWorker.register(
                `sw-manifest.js`
            );
            this.options.onInfoMessage?.('Registrado:'+!!reg.active+','+!!reg.installing+','+!!reg.waiting+','+reg.active?.state+','+reg.installing?.state+','+reg.waiting?.state);
            console.log('Registered:', reg);
            this.currentRegistration = reg;
            //updatefound is fired if service-worker.js changes.
            var ready = new Promise<ServiceWorker>((resolve)=>{
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
                                    this.options?.onNewVersionAvailable?.('nueva')
                                } else {
                                    // At this point, everything has been precached.
                                    // It's the perfect time to display a "Content is cached for offline use." message.
                                    console.log('Content is now available offline!');
                                }
                                //setMessage(`Aplicación actualizada, por favor refresque la pantalla`,'all-ok');
                            break;
                            case 'activated':
                                //setMessage(`Aplicación actualizada, espere a que se refresque la pantalla`,'all-ok');
                                setTimeout(()=>{
                                    this.options.onInfoMessage?.('INSTALADO DEBE REINICIAR');
                                    resolve();
                                },1000)
                            break;
                            case 'redundant':
                                this.options.onError?.(new Error('redundant'));
                                console.error('The installing service worker became redundant.');
                                //setMessage('Se produjo un error al instalar la aplicación. ','danger')
                            break;
                            default:
                                this.options.onInfoMessage?.('other:'+installingWorker.state);
                        }
                    };
                };
            })
            if(!!reg.waiting){
                this.options?.onNewVersionAvailable?.('nueva')
            }
            // Uso promesas para elegir el camino porque así me garantiza que se llaman una sola vez:
            if(!!reg.active){
                this.options?.onActive?.()
            }else{
                this.options?.onInstalling?.()
                await ready
                var refreshNow = !this.options?.onJustInstalled || await this.options?.onJustInstalled()
                if(refreshNow){
                    location.reload()
                }
            }
        }else{
            console.log('serviceWorkers no soportados')
            // acá hay que elegir cómo dar el error:
            // this.options.onError?.(new Error('serviceWorkers no soportados'));
            throw Error ('serviceWorkers no soportados');
        }
    }
    async getSW(variable:string){
        let response = await fetch("@"+variable);
        let varResult = response.statusText;
        return varResult
    }
    async uninstall(){
        var CACHE_NAME = await this.getSW("CACHE_NAME")
        await this.currentRegistration?.unregister();
        if(CACHE_NAME){
            await caches.delete(CACHE_NAME);
        }
    }
    async updateToNewVersion(){
        location.reload();
        // await this.currentRegistration?.waiting?.postMessage('skipWaiting');
        // await this.currentRegistration?.unregister();
    }
}

