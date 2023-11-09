import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IDecoratedLogger, IValidationControl, IValidationControlFactory } from "../interfaces";
import { ValidationControl } from "../classes/ValidationControl";

@injectable()
export class ValidationControlFactory implements IValidationControlFactory{
    private _logger: IDecoratedLogger;

    constructor(@inject(TYPES.DebuggingLogger) logger: IDecoratedLogger) {
        this._logger = logger;
    }

    public create(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): IValidationControl {
        return new ValidationControl(control, this._logger);
    }
}
