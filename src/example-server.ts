import { promises as fs } from "fs";
import {Server4Test, Server4TestOpts} from "server4test";
import * as MiniTools from "mini-tools";

function parseStrCookies(cookieString:string, prefix:string){
    var output = {} as {[k:string]:string};
    cookieString.split(/\s*;\s*/).forEach(function(pairStr:string) {
        var pair = pairStr.split(/\s*=\s*/);
        var varName = pair[0];
        if(varName.substr(0,prefix.length)==prefix){
            varName=varName.slice(prefix.length);
        }
        output[varName] = pair.splice(1).join('=');
    });
    return output;
}


class ExampleServer extends Server4Test{
    constructor(opts:Partial<Server4TestOpts>){
    // @ts-ignore
        super(opts)
    }
    directServices(){
        return super.directServices().concat([
            {path:'/swa-manifest.js', middleware:async function(req, res, next){
                try{
                    var sw = await fs.readFile('dist/service-worker-wo-manifest.js', 'utf8');
                    var manifest = JSON.parse(await fs.readFile('example/example-for-cache.json', 'utf8'));
                    var swManifest = sw
                        .replace("'/*version*/'", JSON.stringify(manifest.version))
                        .replace("'/*appName*/'", JSON.stringify(manifest.appName))
                        .replace(/\[\s*\/\*urlsToCache\*\/\s*\]/, JSON.stringify(manifest.cache))
                        .replace(/\[\s*\/\*fallbacks\*\/\s*\]/, JSON.stringify(manifest.fallback || []))
                        .replace("/#CACHE$/", manifest.onTheFlyCacher);
                    fs.writeFile('dist/local-debug-sw-manifest.js',swManifest,'utf-8');
                    MiniTools.serveText(swManifest,'application/javascript')(req,res);
                }catch(err){
                    MiniTools.serveErr(req,res,next!)(err);
                }
            }},
            {path:'/login-change', middleware:async function(req, res){
                var newState=req.query.state=='N'?'N':'S';
                res.cookie('login', newState)
                res.send('<h2>changed:'+newState+'</h2>')
            }},
            {path:'/login-time', middleware:async function(req, res){
                var cookie = parseStrCookies(req.headers.cookie || '','');
                if(cookie.login=='S'){
                    res.status(200);
                    res.send(new Date().toLocaleTimeString());
                }else{
                    res.status(401);
                    res.send('not logged in');
                }
            }}
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