"use strict";
import {changing} from "best-globals";

export type Options={
    regexVersion?: RegExp,
    onStartLoading:()=>{},
    onEachFile:()=>{},
    onError:(err:Error)=>{},
    onNewVersionAvailable:(version:String)=>{}
}

export default class ServiceWorkerAdmin{
    private options:Options|null=null;
    private currentRegistration:ServiceWorkerRegistration|null = null;
    
    constructor(opts: Options){
        var self = this;
        self.options = opts;
        if('serviceWorker' in navigator){
            navigator.serviceWorker.register('service-worker.js').then(function(reg) {
                console.log('Registered:', reg);
                self.currentRegistration = reg;
                //updatefound is fired if service-worker.js changes.
                reg.onupdatefound = function() {
                    // The updatefound event implies that reg.installing is set; see
                    // https://w3c.github.io/ServiceWorker/#service-worker-registration-updatefound-event
                    var installingWorker = reg.installing;
                    //setMessage('Instalando una nueva version, por favor espere...','warning');
                    installingWorker.onstatechange = async function() {
                        self.options?.onStartLoading();
                        console.log("estado: ", installingWorker.state);
                        switch (installingWorker.state) {
                            case 'installed':
                                if (navigator.serviceWorker.controller) {
                                // At this point, the old content will have been purged and the fresh content will
                                // have been added to the cache.
                                // It's the perfect time to display a "New content is available; please refresh."
                                // message in the page's interface.
                                self.options?.onNewVersionAvailable();
                                console.log('New or updated content is available.');
                                
                                } else {
                                // At this point, everything has been precached.
                                // It's the perfect time to display a "Content is cached for offline use." message.
                                console.log('Content is now available offline!');
                                }
                                //setMessage(`Aplicación actualizada, por favor refresque la pantalla`,'all-ok');
                                break;
                            case 'activated':
                                //setMessage(`Aplicación actualizada, espere a que se refresque la pantalla`,'all-ok');
                                setTimeout(async function(){
                                    location.reload(true);
                                },3000)
                                break;
                            case 'redundant':
                                self.options?.onError();
                                console.error('The installing service worker became redundant.');
                                //setMessage('Se produjo un error al instalar la aplicación. ','danger')
                                break;
                        }
                    };
                };
            }).catch(function(e) {
                console.error('Error during service worker registration:', e);
                throw Error ('Error during service worker registration:', e);
            });
        }else{
            console.log('serviceWorkers no soportados')
            throw Error ('serviceWorkers no soportados');
        }
    }
    async getVersion(){
        let response = await fetch("@version");
        let version = response.statusText;
        return version
    }
}

