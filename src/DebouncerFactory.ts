import { injectable } from "inversify";
import { IDebouncer, IDebouncerFactory } from "./interfaces";
import { Debouncer } from "./util/Debouncer";

@injectable()
export class DebouncerFactory implements IDebouncerFactory {
    create(): IDebouncer {
        return new Debouncer();
    }


}
