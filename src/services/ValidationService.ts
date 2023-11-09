import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import {
    IDecoratedLogger,
    IFormParser,
    IUIHandler,
    IValidationControlFactory,
    IValidationService
} from "../interfaces";
import { Result } from "../classes/Result";

@injectable()
export class ValidationService implements IValidationService {
    constructor(
        @inject(TYPES.DebuggingLogger)
        private readonly _logger: IDecoratedLogger,
        @inject(TYPES.FormParser) private readonly _formParser: IFormParser,
        @inject(TYPES.ValidationControlFactory) private readonly _validationControlFactory: IValidationControlFactory,
        @inject(TYPES.UIHandler) private readonly _uiHandler: IUIHandler
    ) { }

    async validateControl(
        control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    ): Promise<void> {
        const validationControl = this._validationControlFactory.create(control);
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
            this._logger.getLogger().error(error);
        }
        const validationResult = Result.handleSuccess(validationResults);
        if (validationResult === undefined) {
            this._logger.getLogger().error("Validation result is undefined");
            return;
        }
        const errorMessage = validationResult.errorMessages.find(m => m.length > 0);
        //if (errorMessage === undefined) {
        //    return;
        //}
        //validationResult.errorMessage= errorMessage;
        console.log(errorMessage);
        this._uiHandler.updateValidationMessage(validationResult);
    }
}
