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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var ServiceWorkerAdmin = /** @class */ (function () {
        function ServiceWorkerAdmin(opts) {
            this.options = null;
            this.currentRegistration = null;
            var self = this;
            self.options = opts;
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('service-worker.js').then(function (reg) {
                    console.log('Registered:', reg);
                    self.currentRegistration = reg;
                    //updatefound is fired if service-worker.js changes.
                    reg.onupdatefound = function () {
                        // The updatefound event implies that reg.installing is set; see
                        // https://w3c.github.io/ServiceWorker/#service-worker-registration-updatefound-event
                        var installingWorker = reg.installing;
                        //setMessage('Instalando una nueva version, por favor espere...','warning');
                        installingWorker.onstatechange = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    console.log("estado: ", installingWorker.state);
                                    switch (installingWorker.state) {
                                        case 'installed':
                                            if (navigator.serviceWorker.controller) {
                                                // At this point, the old content will have been purged and the fresh content will
                                                // have been added to the cache.
                                                // It's the perfect time to display a "New content is available; please refresh."
                                                // message in the page's interface.
                                                console.log('New or updated content is available.');
                                            }
                                            else {
                                                // At this point, everything has been precached.
                                                // It's the perfect time to display a "Content is cached for offline use." message.
                                                console.log('Content is now available offline!');
                                            }
                                            //setMessage(`Aplicación actualizada, por favor refresque la pantalla`,'all-ok');
                                            break;
                                        case 'activated':
                                            //setMessage(`Aplicación actualizada, espere a que se refresque la pantalla`,'all-ok');
                                            setTimeout(function () {
                                                return __awaiter(this, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        location.reload(true);
                                                        return [2 /*return*/];
                                                    });
                                                });
                                            }, 3000);
                                            break;
                                        case 'redundant':
                                            console.error('The installing service worker became redundant.');
                                            //setMessage('Se produjo un error al instalar la aplicación. ','danger')
                                            break;
                                    }
                                    return [2 /*return*/];
                                });
                            });
                        };
                    };
                })["catch"](function (e) {
                    console.error('Error during service worker registration:', e);
                    throw Error('Error during service worker registration:', e);
                });
            }
            else {
                console.log('serviceWorkers no soportados');
                throw Error('serviceWorkers no soportados');
            }
        }
        ServiceWorkerAdmin.prototype.getVersion = function () {
        };
        return ServiceWorkerAdmin;
    }());
    exports["default"] = ServiceWorkerAdmin;
});
//# sourceMappingURL=service-worker-admin.js.map