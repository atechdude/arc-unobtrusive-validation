export declare class Result<A> {
    private readonly value?;
    private readonly error?;
    get isSuccess(): boolean;
    get isFaulted(): boolean;
    constructor(valueOrError: A | Error);
    ifFail(defaultValue: A): A;
    ifFailWithFunction(func: (err: Error) => A): A;
    ifSucc(func: (val: A) => void): void;
    match<R>(succ: (val: A) => R, fail: (err: Error) => R): R;
    map<B>(func: (val: A) => B): Result<B>;
    mapAsync<B>(func: (val: A) => Promise<B>): Promise<Result<B>>;
    equals(other: Result<A>): boolean;
    toString(): string;
    static handleError<T>(result: Result<T>): Error | undefined;
    static handleSuccess<T>(result: Result<T>): T | undefined;
}
