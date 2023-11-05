import { inject, injectable } from "inversify";
import { Debouncer } from "./util/Debouncer";
import { IDebouncerFactory, IDebouncerManager } from "./interfaces";
import { TYPES } from "./di/container-types";

@injectable()
export class DebouncerManager implements IDebouncerManager {
    private debouncers: { [key: string]: Debouncer } = {};

    constructor(@inject(TYPES.DebouncerFactory) private readonly _debounceFactory: IDebouncerFactory) {}

    getDebouncerForControl(controlName: string): Debouncer {
        if (!this.debouncers[controlName]) {
            this.debouncers[controlName] = this._debounceFactory.create();
        }
        return this.debouncers[controlName];
    }

    clearDebouncersForControl(controlName: string): void {
        const debouncer = this.debouncers[controlName];
        if (debouncer) {
            debouncer.cancel(); // Assuming the debouncer has a cancel method
            delete this.debouncers[controlName];
        }
    }
    clearDebouncersForControls(controlNames: string[]): void {
        controlNames.forEach(controlName => {
            const debouncer = this.debouncers[controlName];
            if (debouncer) {
                debouncer.cancel(); // Assuming the debouncer has a cancel method
                delete this.debouncers[controlName];
            }
        });
    }

}
