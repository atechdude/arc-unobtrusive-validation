import { IDebouncer } from "../interfaces";
/**
 * Provides a mechanism to debounce function execution.
 *
 * The `Debouncer` class is responsible for delaying the execution of a function until after a certain time
 * has elapsed since the last time it was invoked. This is useful in situations where you want to
 * limit the rate at which a function is called, such as when responding to user input or window resizing.
 *
 * The class is marked with `@injectable`, allowing it to be used with dependency injection frameworks.
 */
export declare class Debouncer implements IDebouncer {
    constructor();
    private timeoutId?;
    /**
     * Debounces the provided function.
     *
     * This method takes a function and a wait time in milliseconds. It will delay the execution of the function
     * until after the wait time has elapsed since the last call to debounce. Subsequent calls to debounce
     * with a new function will cancel any pending execution from previous calls.
     * @template T - The type of the function to debounce.
     * @param {T} func - The function to be debounced.
     * @param {number} waitMilliseconds - The number of milliseconds to wait before calling the function.
     */
    debounce<T extends (...args: any[]) => void>(func: T, waitMilliseconds: number): void;
    getTimeoutId(): number | undefined;
    /**
     * Cancels any pending debounced function calls.
     *
     * If there is a debounced function that has not yet been executed, calling this method will prevent
     * that function from being called.
     */
    cancel(): void;
}
