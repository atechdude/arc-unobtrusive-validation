import { IDebouncer } from "./IDebouncer";
export interface IDebouncerManager {
    getDebouncerForControl(controlName: string): IDebouncer;
    clearDebouncersForControl(controlName: string): void;
    clearDebouncersForControls(controlNames: string[]): void;
}
