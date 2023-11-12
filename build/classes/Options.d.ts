import { IOptions } from "../interfaces";
export declare class Options implements IOptions {
    debug: boolean;
    logLevel: string;
    useDefaultFormSubmitter: boolean;
    constructor();
    autoInit: boolean;
}
