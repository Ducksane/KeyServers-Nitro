declare type AnyHook = (...args: any[]) => any;
declare type ReactSharedInternalsType = {
    ReactCurrentDispatcher: {
        current?: {
            [name: string]: AnyHook;
        };
    };
};
export declare const ReactSharedInternals: ReactSharedInternalsType;
export declare const ReactCurrentDispatcher: {
    current?: {
        [name: string]: AnyHook;
    } | undefined;
};
export {};
