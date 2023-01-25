declare type Hook<T> = (initialData?: any) => T;
export declare const useBetween: <T>(hook: Hook<T>) => T;
export declare const useInitial: <T = any>(data?: T | undefined, server?: boolean | undefined) => void;
export declare const mock: <T>(hook: Hook<T>, state: any) => () => void;
export declare const get: <T>(hook: Hook<T>) => T;
export declare const free: (...hooks: Hook<any>[]) => void;
export declare const clear: () => void;
export declare const on: <T>(hook: Hook<T>, fn: (state: T) => void) => () => void;
export {};
