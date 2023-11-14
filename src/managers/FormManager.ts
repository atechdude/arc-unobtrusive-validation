import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IDecoratedLogger, IFormManager, IFormService } from "../interfaces";

/**
 * Manages the lifecycle and interactions of forms within a web page.
 * It observes the DOM for new forms being added dynamically and incorporates them into the form management system.
 */
@injectable()

export class FormManager implements IFormManager {
    private mutationObserver: MutationObserver | null = null;
    /**
     * Initializes an instance of the FormManager with dependencies.
     * @param {IFormService} _formService - Service to manage forms' functionalities.
     * @param {IDecoratedLogger} _logger - Logger for debugging and logging information.
     */
    constructor(
        @inject(TYPES.FormService) private readonly _formService: IFormService,
        @inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger
    ) {

    }
    /**
     * Initializes the FormManager by creating forms and starting observation on DOM mutations.
     * This method prepares the FormManager to automatically manage existing and dynamically added forms.
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     */
    async init(): Promise<void> {

        this.createForms();
        this.startObserving();
        this._logger.getLogger().info("FormManager: initialized");
    }
    /**
     * Iterates over all form elements present in the document and attempts to add each one to the forms collection.
     * This method ensures that all existing forms on the page are managed by the FormManager.
     * Errors during the addition of individual forms are logged and do not halt the process for subsequent forms.
     */
    createForms(): void {
        const forms = document.querySelectorAll("form");
        const formsArray = Array.from(forms);
        for (const formElement of formsArray) {
            try {
                this._formService.addForm(formElement as HTMLFormElement);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                this._logger
                    .getLogger()
                    .error(
                        `FormManager: createForms: Error when adding form: ${errorMessage}`
                    );
                continue;
            }
        }
    }
    /**
     * Initiates the observation of the DOM for any additions or removals of form elements.
     * When a new form is added to the DOM, it automatically gets incorporated into the form management system.
     * This method enables the FormManager to dynamically adapt to changes in the webpage's form structure.
     */
    startObserving(): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        this.mutationObserver = new MutationObserver((mutationsList) => {
            // Let the FormManager handle the mutations
            this.handleFormMutations(mutationsList);
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    /**
     * Stops the observation process of the DOM for form elements.
     * This method can be called to halt the dynamic tracking of form elements, usually when cleaning up or reconfiguring.
     */
    public stopObserving(): void {
        this.mutationObserver?.disconnect();
    }
    /**
     * Handles mutations observed in the DOM, specifically targeting the addition of new forms.
     * This method is responsible for integrating newly added forms (both direct and nested) into the form management system.
     * @param {MutationRecord[]} mutationsList - An array of MutationRecord objects representing individual changes in the DOM.
     */
    handleFormMutations(mutationsList: MutationRecord[]): void {
        try {
            for (const mutation of mutationsList) {
                if (mutation.type === "childList") {
                    // Process direct forms
                    const directForms = Array.from(mutation.addedNodes).filter(
                        (node): node is HTMLFormElement =>
                            node instanceof HTMLFormElement
                    );
                    for (const form of directForms) {
                        //this._formService.setSubmitHandler(form.name, form.submitHandler);
                        this._formService.addForm(form);
                    }

                    // Process nested forms
                    const nestedForms = Array.from(mutation.addedNodes)
                        .filter(
                            (node): node is HTMLElement =>
                                node instanceof HTMLElement
                        )
                        .flatMap((node) =>
                            Array.from(node.querySelectorAll("form"))
                        );
                    for (const form of nestedForms) {
                        //this._formService.setSubmitHandler(form.name, form.submitHandler);
                        this._formService.addForm(form);
                    }
                }
            }
        } catch (error) {
            // If error is an instance of Error, log its message; otherwise, log the error directly
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            this._logger
                .getLogger()
                .error(`Error in handleFormMutations: ${errorMessage}`);
        }
    }
}
