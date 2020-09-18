"use strict";
import {ServiceWorkerAdmin, Options} from "../dist/service-worker-admin";
window.onload=function(){
    var options: Options={
        onEachFile: ()=>console.log('on each file'),
        onStartLoading: ()=>console.log('starting download'),
        onError: (err)=>console.log('on error', err),
        onNewVersionAvailable: (version:string)=>console.log('on new version available ', version)
    }
    var swa = new ServiceWorkerAdmin(options)
    //swa.installFrom('./example-for-cache.json')
    console.log("swa ", swa)
}