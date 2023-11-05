import { injectable } from "inversify";
import { IOptions, IValidationRule } from "./interfaces";
@injectable()
export class Options implements IOptions {
    debug: boolean;
    logLevel: string;
    constructor() {
        this.debug = false;
        this.logLevel = "info";
    }
    customRules?: IValidationRule[] | undefined;
    autoInit: boolean = true;
}
