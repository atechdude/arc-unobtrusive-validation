import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { ValidationControl } from "../ValidationControl";
import {

    IFormParser,


    IValidationService
} from "../interfaces";

@injectable()
export class ValidationService implements IValidationService {
    constructor(
        @inject(TYPES.FormParser) private readonly _formParser: IFormParser
    ) {}
    validateControl(control:HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): void
    {
        const validationControl = new ValidationControl(control);
        const info = this._formParser.getValidationInformation(control);
        console.log(info);

        //const validationRules = this._formParser.getValidationRules(control);
        //console.log(validationRules);
        //validationControl.validate(validationRules);
        // return validationControl;


    }
}
