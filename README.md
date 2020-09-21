# service-worker-admin
manager for service workers using json and manifest files

## Desarrollo

Hasta acá tenemos un `service-worker.js` genérico 
(lo cual no sé si es la mejor idea porque [Matt Gaunt dice](https://developers.google.com/web/fundamentals/primers/service-workers?hl=es) que el mecanismo de actualización se basa en el cambio sobre este archivo, además todos los ejemplos tienen la lista a cachear acá dentro). De todos modos eso se puede cambiar después usando templates que pisen la lista dentro del código. 

La API se basa en que parte del conocimiento lo tiene el cliente (la dirección del "manifiesto" y el nombre de la aplicación). 
El uso sería así:

```ts
var swa = new ServiceWorkerAdmin()
swa.installFrom({
    manifest:'./example-for-cache.json',
    appName:'example',
    onInstalling:()=>{
        document.getElemntById('installing').style.display='block';
    },
    onInstalled:async ()=>{
        var confirm = await confirm('Ready to run. Reload?');
        return confirm; // si contesta TRUE sw hace el reload
    },
    onActive:()=>{
        // solo se llama si estaba instalado previamente después del reload
        document.getElemntById('main-app').style.display='block';
        startApp();
    }
})
```
## Defectos

   1. Esta aproximación requiere conocer y pasarle el nombre del manifiesto
   2. Hay que hacer el reinicio a mano

## Mejoras

   1. Que el `service-worker.js` tenga un área donde el servidor mergee y ponga la lista de URL, el nombre de la CACHE etc...

