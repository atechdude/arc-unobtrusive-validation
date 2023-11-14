import { IDecoratedLogger, IFormManager, IFormService } from "../interfaces";
/**
 * Manages the lifecycle and interactions of forms within a web page.
 * It observes the DOM for new forms being added dynamically and incorporates them into the form management system.
 */
export declare class FormManager implements IFormManager {
    private readonly _formService;
    private readonly _logger;
    private mutationObserver;
    /**
     * Initializes an instance of the FormManager with dependencies.
     * @param {IFormService} _formService - Service to manage forms' functionalities.
     * @param {IDecoratedLogger} _logger - Logger for debugging and logging information.
     */
    constructor(_formService: IFormService, _logger: IDecoratedLogger);
    /**
     * Initializes the FormManager by creating forms and starting observation on DOM mutations.
     * This method prepares the FormManager to automatically manage existing and dynamically added forms.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    init(): Promise<void>;
    /**
     * Iterates over all form elements present in the document and attempts to add each one to the forms collection.
     * This method ensures that all existing forms on the page are managed by the FormManager.
     * Errors during the addition of individual forms are logged and do not halt the process for subsequent forms.
     */
    createForms(): void;
    /**
     * Initiates the observation of the DOM for any additions or removals of form elements.
     * When a new form is added to the DOM, it automatically gets incorporated into the form management system.
     * This method enables the FormManager to dynamically adapt to changes in the webpage's form structure.
     */
    startObserving(): void;
    /**
     * Stops the observation process of the DOM for form elements.
     * This method can be called to halt the dynamic tracking of form elements, usually when cleaning up or reconfiguring.
     */
    stopObserving(): void;
    /**
     * Handles mutations observed in the DOM, specifically targeting the addition of new forms.
     * This method is responsible for integrating newly added forms (both direct and nested) into the form management system.
     * @param {MutationRecord[]} mutationsList - An array of MutationRecord objects representing individual changes in the DOM.
     */
    handleFormMutations(mutationsList: MutationRecord[]): void;
}
