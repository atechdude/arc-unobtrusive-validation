import { inject, injectable } from "inversify";
import { IDecoratedLogger, IForm, IFormFactory } from "../interfaces";
import { Result } from "../classes/Result";
import { TYPES } from "../di/container-types";
import { Form } from "../classes/Form";

/**
 * FormFactory is responsible for creating Form objects from HTMLFormElements.
 * It ensures that each form has an identifiable attribute (id or name) for validation purposes.
 * It utilizes a logger for error handling and logging important information during the form creation process.
 */
@injectable()
export class FormFactory implements IFormFactory {
    /**
     * Constructs a FormFactory instance with dependency injection for logging.
     * @param {IDecoratedLogger} _logger - Logger injected for logging messages and errors.
     */
    constructor(@inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger) { }
    /**
     * Creates a Form object from a given HTMLFormElement.
     * Validates if the form element has an id or name attribute for identification.
     * Logs and handles errors encountered during form creation.
     * @param {HTMLFormElement} formElement - The HTML form element to be processed.
     * @returns {Result<IForm>} A Result object containing either a Form object or an error.
     */
    create(formElement: HTMLFormElement): Result<IForm> {
        try {
            if (!formElement.id && !formElement.name) {
                const errorMsg = `FormFactory: form element ${formElement.outerHTML} has no id or name attribute. We can't validate a form we can't identify.`;
                this._logger.getLogger().error(errorMsg);
                return new Result<IForm>(new Error(errorMsg));
            }

            const form = new Form(formElement);
            this._logger.getLogger().info(`FormFactory: Form ${formElement.id || formElement.name} created successfully.`);
            return new Result<IForm>(form);
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : `Unknown error during form creation: ${String(error)}`;
            this._logger.getLogger().error(`FormFactory: Error in create method - ${errorMsg}`);
            return new Result<IForm>(new Error(errorMsg));
        }
    }
}
