import { IDebouncer } from "./IDebouncer";
export interface IDebouncerFactory {
    create(): IDebouncer;
}
