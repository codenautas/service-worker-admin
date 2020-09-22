"use strict";

export type Options={
    // Se llaman varias veces
    onInfoMessage:(message?:string)=>void
    onEachFile:()=>void
    onError:(err:Error)=>void
    onReadyToStart:(installing:boolean)=>void // Muestra la pantalla de instalando o la pantalla principal de la aplicación
    onJustInstalled:(run:()=>void)=>void // para mostra "fin de la instalación y poner el botón "entrar"=>run()
        // run hace reload
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
            var handleNewVersion = async  ()=>{
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
                            this.options.onInfoMessage?.('El SW informa "redundante"'); // aparentemente esto no es un error
                            console.error('The installing service worker became redundant.');
                            //setMessage('Se produjo un error al instalar la aplicación. ','danger')
                        break;
                        default:
                            this.options.onInfoMessage?.('other:'+installingWorker.state);
                    }
                };
            };
            if(!!reg.waiting && reg.active){
                handleNewVersion();
            }
            this.options?.onReadyToStart?.(!reg.active);
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
}

