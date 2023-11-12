import { IDecoratedLogger, IValidationControl, IValidationControlFactory } from "../interfaces";
export declare class ValidationControlFactory implements IValidationControlFactory {
    private _logger;
    constructor(logger: IDecoratedLogger);
    create(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): IValidationControl;
}
