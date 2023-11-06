export class Result<A> {
    private readonly value?: A;
    private readonly error?: Error;

    get isSuccess(): boolean {
        return this.error === undefined;
    }

    get isFaulted(): boolean {
        return this.error !== undefined;
    }

    constructor(valueOrError: A | Error) {
        if (valueOrError instanceof Error) {
            this.error = valueOrError;
        } else {
            this.value = valueOrError;
        }
    }

    ifFail(defaultValue: A): A {
        return this.isFaulted ? defaultValue : this.value!;
    }

    ifFailWithFunction(func: (err: Error) => A): A {
        return this.isFaulted ? func(this.error!) : this.value!;
    }

    ifSucc(func: (val: A) => void): void {
        if (this.isSuccess) {
            func(this.value!);
        }
    }

    match<R>(succ: (val: A) => R, fail: (err: Error) => R): R {
        return this.isFaulted ? fail(this.error!) : succ(this.value!);
    }

    map<B>(func: (val: A) => B): Result<B> {
        if (this.isSuccess) {
            try {
                const newValue = func(this.value!);
                return new Result<B>(newValue);
            } catch (error) {
                // Ensure the error is of type Error
                if (error instanceof Error) {
                    return new Result<B>(error);
                } else {
                    // Create a new error from the caught exception if it's not an instance of Error
                    return new Result<B>(new Error(String(error)));
                }
            }
        }
        return new Result<B>(this.error!);
    }

    async mapAsync<B>(func: (val: A) => Promise<B>): Promise<Result<B>> {
        if (this.isSuccess) {
            try {
                const newValue = await func(this.value!);
                return new Result<B>(newValue);
            } catch (error) {
                // Ensure the error is of type Error
                if (error instanceof Error) {
                    return new Result<B>(error);
                } else {
                    // Create a new error from the caught exception if it's not an instance of Error
                    return new Result<B>(new Error(String(error)));
                }
            }
        }
        return new Result<B>(this.error!);
    }

    equals(other: Result<A>): boolean {
        if (this.isFaulted && other.isFaulted) {
            return this.error!.message === other.error!.message;
        }
        if (this.isSuccess && other.isSuccess) {
            return this.value === other.value; // Nothing fancy here
        }
        return false;
    }

    toString(): string {
        return this.isFaulted
            ? `(Error: ${this.error!.message})`
            : `(Value: ${this.value})`;
    }

    static handleError<T>(result: Result<T>): Error | undefined {
        if (!result.isSuccess) {
            return result.error;
        }
        return undefined;
    }

    static handleSuccess<T>(result: Result<T>): T | undefined {
        if (result.isSuccess) {
            return result.value;
        }
        return undefined;
    }
}
