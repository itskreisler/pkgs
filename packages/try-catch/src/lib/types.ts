export type TtryCatchPromise = Promise<TtryCatch>;
export type TtryCatch = [error: Error | null | unknown, result?: T];
export type Tfn = (...args: any[]) => any;
export type T = any;