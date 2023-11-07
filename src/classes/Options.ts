import { injectable } from "inversify";
import { IOptions } from "../interfaces";

@injectable()
export class Options implements IOptions {
    debug: boolean;
    logLevel: string;
    constructor() {
        this.debug = false;
        this.logLevel = "info";
    }

    autoInit: boolean = true;
}
