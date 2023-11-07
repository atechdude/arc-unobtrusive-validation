import { injectable } from "inversify";
import { IDebouncer, IDebouncerFactory } from "../interfaces";
import { Debouncer } from "../utils/Debouncer";

/**
 * A factory for creating instances of `Debouncer`.
 *
 * The `DebouncerFactory` class implements the `IDebouncerFactory` interface
 * and is responsible for providing a method to create new `Debouncer` objects.
 * This class uses the `@injectable` decorator to allow it to be injected into
 * other components, enhancing modularity and testability.
 * @see {@link IDebouncerFactory} for interface documentation.
 */
@injectable()
export class DebouncerFactory implements IDebouncerFactory {
    constructor() {
        console.log("DebouncerFactory constructor");
    }
    /**
     * Creates a new instance of `Debouncer`.
     *
     * This method implements the `create` method from the `IDebouncerFactory` interface.
     * It allows consumers to obtain a fresh instance of `Debouncer` without needing to know
     * the details of how the `Debouncer` is constructed.
     * @returns {IDebouncer} An instance of `Debouncer` which can be used to debounce function calls.
     */
    create(): IDebouncer {
        return new Debouncer();
    }
}
