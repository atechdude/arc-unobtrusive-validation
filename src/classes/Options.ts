import { injectable } from "inversify";
import { IOptions } from "../interfaces";

@injectable()
export class Options implements IOptions {
    debug: boolean;
    logLevel: string;
    useDefaultFormSubmitter: boolean;
    constructor() {
        this.debug = false;
        this.logLevel = "info";
        this.useDefaultFormSubmitter = true;
    }

    autoInit: boolean = true;
}
