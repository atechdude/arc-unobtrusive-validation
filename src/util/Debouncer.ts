

import { injectable } from "inversify";
import { IDebouncer } from "../interfaces";




@injectable()
export class Debouncer implements IDebouncer {
    constructor()
    {
    }
    private timeoutId?: ReturnType<typeof setTimeout>;

    debounce<T extends (...args: any[]) => void>(func: T, waitMilliseconds: number): void {
        // Clear the existing timeout, if there is one
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
        }

        // Start a new timeout
        this.timeoutId = setTimeout(() => {
            func();
            this.timeoutId = undefined;
        }, waitMilliseconds);
    }
    cancel(): void {
        clearTimeout(this.timeoutId);
    }
}





