"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var CACHE_NAME = '#20-09-16'; //BUSCAR
var FALLBACK = '/eseco/campo'; //BUSCAR
var urlsToCache = [
//"campo",
//"lib/react.production.min.js",
//"lib/react-dom.production.min.js",
//"lib/material-ui.production.min.js",
//"lib/clsx.min.js",
//"lib/redux.min.js",
//"lib/react-redux.min.js",
//"lib/require-bro.js",
//"lib/like-ar.js",
//"lib/best-globals.js",
//"lib/json4all.js",
//"lib/js-to-html.js",
//"lib/redux-typed-reducer.js",
//"lib/memoize-one.js",
//"adapt.js",
//"tipos.js",
//"digitov.js",
//"redux-formulario.js",
//"render-general.js",
//"render-formulario.js",
//"client_modules/row-validator.js",
//"unlogged.js",
//"lib/js-yaml.js",
//"lib/xlsx.core.min.js",
//"lib/lazy-some.js",
//"lib/sql-tools.js",
//"dialog-promise/dialog-promise.js",
//"moment/min/moment.js",
//"pikaday/pikaday.js",
//"lib/polyfills-bro.js",
//"lib/big.js",
//"lib/type-store.js",
//"lib/typed-controls.js",
//"lib/ajax-best-promise.js",
//"my-ajax.js",
//"my-start.js",
//"lib/my-localdb.js",
//"lib/my-websqldb.js",
//"lib/my-localdb.js.map",
//"lib/my-websqldb.js.map",
//"lib/my-inform-net-status.js",
//"lib/my-skin.js",
//"lib/cliente-en-castellano.js",
//"client/client.js",
//"client/menu.js",
//"dialog-promise/dialog-promise.css",
//"pikaday/pikaday.css",
//"css/offline-mode.css",
//"css/formulario-react.css",
//"img/main-loading.gif",
];
self.addEventListener('install', function (event) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        //si hay cambios no espero para cambiarlo
        self.skipWaiting();
        console.log("instalando");
        event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(urlsToCache);
        }));
        return [2 /*return*/];
    });
}); });
self.addEventListener('fetch', function (event) {
    var sourceParts = event.request.url.split('/');
    var source = sourceParts[sourceParts.length - 1];
    console.log("source", source);
    if (source == '@version') {
        var miBlob = new Blob();
        var opciones = { "status": 200, "statusText": CACHE_NAME, ok: true };
        var miRespuesta = new Response(miBlob, opciones);
        event.respondWith(miRespuesta);
    }
    else {
        event.respondWith(caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                console.log("respuesta caché: ", response);
                return response || fetch(event.request).then(function (response) {
                    console.log("respuesta", response);
                    if (!response) {
                        console.log("no tiene respuesta");
                        throw Error('without response');
                    }
                    return response;
                })["catch"](function (err) {
                    console.log(err);
                    return new Response("<p>Se produjo un error al intentar cargar la p&aacute;gina, es posible que no haya conexi&oacute;n a internet</p><a href=" + FALLBACK + ">Volver a Hoja de Ruta</button>", {
                        headers: { 'Content-Type': 'text/html' }
                    });
                });
            });
        }));
    }
});
self.addEventListener('activate', function (event) {
    console.log("borrando caches viejas");
    event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.filter(function (cacheName) {
            return cacheName != CACHE_NAME;
        }).map(function (cacheName) {
            console.log("borrando cache ", cacheName);
            return caches["delete"](cacheName);
        }));
    }));
});
//# sourceMappingURL=service-worker.js.map