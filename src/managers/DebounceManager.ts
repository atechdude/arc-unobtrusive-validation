import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IDebouncerFactory, IDebouncerManager } from "../interfaces";
import { Debouncer } from "../utils/Debouncer";

/**
 * Manages debouncers for individual form controls to optimize performance by limiting the rate at which certain operations like event handling can be performed.
 */
@injectable()
export class DebouncerManager implements IDebouncerManager {
    private debouncers: { [key: string]: Debouncer } = {};
    /**
     * Initializes a new instance of the DebouncerManager with a factory for creating debouncers.
     * @param {IDebouncerFactory} _debounceFactory - The factory used to create new debouncer instances.
     */
    constructor(
        @inject(TYPES.DebouncerFactory)
        private readonly _debounceFactory: IDebouncerFactory
    ) {

    }
    /**
     * Retrieves or creates a debouncer for a given control name.
     * @param {string} controlName - The name of the control for which to get or create a debouncer.
     * @returns {Debouncer} The debouncer associated with the specified control name.
     */
    getDebouncerForControl(controlName: string): Debouncer {
        if (!this.debouncers[controlName]) {
            this.debouncers[controlName] = this._debounceFactory.create();
        }
        return this.debouncers[controlName];
    }
    /**
     * Cancels and clears a debouncer associated with a specific control name.
     * @param {string} controlName - The name of the control whose debouncer should be cleared.
     */
    clearDebouncersForControl(controlName: string): void {
        const debouncer = this.debouncers[controlName];
        if (debouncer) {
            debouncer.cancel(); // Assuming the debouncer has a cancel method
            delete this.debouncers[controlName];
        }
    }
    /**
     * Cancels and clears debouncers for multiple controls.
     * @param {string[]} controlNames - An array of control names whose debouncers should be cleared.
     */
    clearDebouncersForControls(controlNames: string[]): void {
        controlNames.forEach((controlName) => {
            if (
                Object.prototype.hasOwnProperty.call(
                    this.debouncers,
                    controlName
                )
            ) {
                this.debouncers[controlName].cancel();
                delete this.debouncers[controlName];
            }
        });
    }
}
