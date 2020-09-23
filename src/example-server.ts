import { promises as fs } from "fs";
import {Server4Test, Server4TestOpts} from "server4test";
import * as MiniTools from "mini-tools";

class ExampleServer extends Server4Test{
    constructor(opts:Partial<Server4TestOpts>){
    // @ts-ignore
        super(opts)
    }
    directServices(){
        return super.directServices().concat([
            {path:'/sw-manifest.js', middleware:async function(req, res, next){
                try{
                    var sw = await fs.readFile('dist/service-worker-wo-manifest.js', 'utf8');
                    var manifest = JSON.parse(await fs.readFile('example/example-for-cache.json', 'utf8'));
                    var swManifest = sw
                        .replace("'/*version*/'", JSON.stringify(manifest.version))
                        .replace("'/*appName*/'", JSON.stringify(manifest.appName))
                        .replace(/\[\s*\/\*urlsToCache\*\/\s*\]/, JSON.stringify(manifest.cache));
                    fs.writeFile('dist/local-debug-sw-manifest.js',swManifest,'utf-8');
                    MiniTools.serveText(swManifest,'application/javascript')(req,res);
                }catch(err){
                    MiniTools.serveErr(req,res,next!)(err);
                }
            }},
        ])
    }
}

var server = new ExampleServer({
    port:8080, 
    verbose:true,
    "server4test-directory": true,
    // @ts-ignore
    "public-dir": ['./example', './dist', './node_modules'],
    "serve-content":{
        allowAllExts:true,
    },
    "local-file-repo":{
        enabled: false,
        delay:200, 
        directory: "local-file-repo",
        readRequest:{
            method:'get',
            path:'/file-read'
        },
        writeRequest:{
            method:'get',
            path:'/file-write'
        },
        deleteRequest:{
            method:'get',
            path:'/file-delete'
        }
    }
});

server.start().then(function(){
    console.log('try: http://localhost:8080/example.html');
});