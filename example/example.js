"use strict";
//import {ServiceWorkerAdmin} from "../dist/service-worker-admin";
var ServiceWorkerAdmin=require("../dist/service-worker-admin.js").ServiceWorkerAdmin;
window.onload=function(){
    var options={
        onEachFile: ()=>console.log('on each file'),
        onStartLoading: ()=>console.log('starting download'),
        onError: (err)=>console.log('on error', err),
        onNewVersionAvailable: (version)=>console.log('on new version available ', version)
    }
    var swa = new ServiceWorkerAdmin(options)
    //swa.installFrom('./example-for-cache.json')
    console.log("swa ", swa)
}