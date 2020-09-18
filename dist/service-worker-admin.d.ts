export declare type Options = {
    regexVersion?: RegExp;
    onStartLoading: () => {};
    onEachFile: () => {};
    onError: (err: Error) => {};
    onNewVersionAvailable: (version: String) => {};
};
export default class ServiceWorkerAdmin {
    private options;
    private currentRegistration;
    constructor(opts: Options);
    getVersion(): void;
}
