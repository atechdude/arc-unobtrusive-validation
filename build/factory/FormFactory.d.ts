import { IDecoratedLogger, IForm, IFormFactory } from "../interfaces";
import { Result } from "../classes/Result";
/**
 * FormFactory is responsible for creating Form objects from HTMLFormElements.
 * It ensures that each form has an identifiable attribute (id or name) for validation purposes.
 * It utilizes a logger for error handling and logging important information during the form creation process.
 */
export declare class FormFactory implements IFormFactory {
    private readonly _logger;
    /**
     * Constructs a FormFactory instance with dependency injection for logging.
     * @param {IDecoratedLogger} _logger - Logger injected for logging messages and errors.
     */
    constructor(_logger: IDecoratedLogger);
    /**
     * Creates a Form object from a given HTMLFormElement.
     * Validates if the form element has an id or name attribute for identification.
     * Logs and handles errors encountered during form creation.
     * @param {HTMLFormElement} formElement - The HTML form element to be processed.
     * @returns {Result<IForm>} A Result object containing either a Form object or an error.
     */
    create(formElement: HTMLFormElement): Result<IForm>;
}
