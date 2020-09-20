# service-worker-admin
manager for service workers using json and manifest files

## Desarrollo

Hasta acá tenemos un `service-worker.js` genérico 
(lo cual no sé si es la mejor idea porque [Matt Gaunt dice](https://developers.google.com/web/fundamentals/primers/service-workers?hl=es) que el mecanismo de actualización se basa en el cambio sobre este archivo, además todos los ejemplos tienen la lista a cachear acá dentro). De todos modos eso se puede cambiar después usando templates que pisen la lista dentro del código. 

La API se basa en que parte del conocimiento lo tiene el cliente (la dirección del "manifiesto" y el nombre de la aplicación). 
El uso sería así:

```ts
window.addEventListener('load', async()={
    var swa = new ServiceWorkerAdmin()
    swa.setOptions(options);
    var instalado = await swa.installFrom('./example-for-cache.json','example');
    if(instalado.isActive){
        // mostrar la aplicación
        buttonUninstall.onclick=()=>{
            swa.uninstall();
        }
    }else{
        // mostrar cartel instalando
        await instalado.ready()
        // mostrar cartel listo para arrancar y reiniciar
    }
})
```

## Defectos

   1. Esta aproximación requiere conocer y pasarle el nombre del manifiesto
   2. Hay que hacer el reinicio a mano

## Mejoras

   1. Que el `service-worker.js` tenga un área donde el servidor mergee y ponga la lista de URL, el nombre de la CACHE etc...
   2. Que en vez de estar basado en promesas esté todo basado en callbacks de modo que se garantice el flujo y el reinicio
