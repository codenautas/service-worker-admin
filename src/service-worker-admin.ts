"use strict";

export type Options={
    regexVersion?: RegExp,
    onInfoMessage:(message?:string)=>void,
    onEachFile:()=>void,
    onError:(err:Error)=>void,
    onNewVersionAvailable:(version:string)=>void
}

export class ServiceWorkerAdmin{
    private options:Partial<Options>={};
    private currentRegistration:ServiceWorkerRegistration|null = null;
    constructor(){
    }
    setOptions(opts: Options){
        this.options = opts;
    }
    async installFrom(pathToServiceWorker:string, manifestPath:string, appName:string){
        if('serviceWorker' in navigator){
            var params = new URLSearchParams();
            params.append('appName',appName);
            params.append('manifestPath',manifestPath);
            var reg = await navigator.serviceWorker.register(
                `${pathToServiceWorker}/service-worker.js?${params}`
            );
            this.options.onInfoMessage?.('Registrado');
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
                                this.options.onInfoMessage?.('V 1');
                                console.log('New or updated content is available.');
                            } else {
                                // At this point, everything has been precached.
                                // It's the perfect time to display a "Content is cached for offline use." message.
                                this.options.onInfoMessage?.('V 2');
                                console.log('Content is now available offline!');
                            }
                            //setMessage(`Aplicación actualizada, por favor refresque la pantalla`,'all-ok');
                        break;
                        case 'activated':
                            //setMessage(`Aplicación actualizada, espere a que se refresque la pantalla`,'all-ok');
                            this.options.onInfoMessage?.('V 3');
                            setTimeout(()=>{
                                this.options.onInfoMessage?.('DEBE REINICIAR');
                                // location.reload(true);
                            },3000)
                        break;
                        case 'redundant':
                            this.options.onError?.(new Error('redundant'));
                            console.error('The installing service worker became redundant.');
                            //setMessage('Se produjo un error al instalar la aplicación. ','danger')
                        break;
                    }
                };
            };
        }else{
            console.log('serviceWorkers no soportados')
            // acá hay que elegir cómo dar el error:
            // this.options.onError?.(new Error('serviceWorkers no soportados'));
            throw Error ('serviceWorkers no soportados');
        }
    }
    async getVersion(){
        let response = await fetch("@version");
        let version = response.statusText;
        return version
    }
}

