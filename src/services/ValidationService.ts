import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import {
    IDecoratedLogger,
    IFormParser,
    IValidationService
} from "../interfaces";
import { ValidationControl } from "../classes/ValidationControl";
import { Result } from "../classes/Result";

@injectable()
export class ValidationService implements IValidationService {
    constructor(
        @inject(TYPES.DebuggingLogger)
        private readonly _logger: IDecoratedLogger,
        @inject(TYPES.FormParser) private readonly _formParser: IFormParser
    ) { }

    async validateControl(
        control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    ): Promise<void> {
        const validationControl = new ValidationControl(control);
        const getValidationInformationResults =
            this._formParser.getValidationInformation(control);

        if (!getValidationInformationResults.isSuccess) {
            const error = Result.handleError(getValidationInformationResults);
            this._logger.getLogger().error(error);
        }
        const getValidationRulesResult = Result.handleSuccess(
            getValidationInformationResults
        );
        if (getValidationRulesResult === undefined) {
            this._logger.getLogger().error("Validation rules are undefined");
            return;
        }

        // Destructure the getValidationRulesResult
        const { rules } = getValidationRulesResult;


        const validationResults = await validationControl.validate(rules);
        if (!validationResults.isSuccess) {
            const error = Result.handleError(validationResults);

            // This is where we pass the error to the UIHandler we have not coded yet!!
            this._logger.getLogger().info("Validation Error:", error);
            return;
        }

        const validationResult = Result.handleSuccess(validationResults);
        if (validationResult === undefined) {
            this._logger.getLogger().error("Validation result is undefined");
            return;
        }
        console.log(validationResult);
    }
}
