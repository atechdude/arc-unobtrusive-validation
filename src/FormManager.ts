import { inject, injectable } from "inversify";
import {
    IDecoratedLogger,
    IEventEmitter,
    IForm,
    IFormFactory,
    IFormManager,
    IObservableCollection
} from "./interfaces";
import { TYPES } from "./di/container-types";
import { Result } from "./Result";

@injectable()
/**
 * Manages form instances within the application, including the creation
 * of form objects and the observation of DOM mutations for dynamically
 * added forms.
 * @class
 * @implements {IFormManager}
 */
export class FormManager implements IFormManager {
    private mutationObserver: MutationObserver | null = null;
    /**
     * Constructs the FormManager instance responsible for managing form instances.
     * It utilizes dependency injection to incorporate various services such as
     * form collection management, form creation, event emission, and logging.
     * @param {IObservableCollection<IForm>} _formsCollection - An observable collection that maintains the forms.
     * @param {IFormFactory} _formFactory - A factory service for creating new form instances.
     * @param {IEventEmitter<any>} _eventEmitter - An event emitter service to handle form-related events.
     * @param {IDecoratedLogger} _logger - A logging service for error and debug reporting.
     */
    constructor(
        @inject(TYPES.ObservableFormsCollection)
        private readonly _formsCollection: IObservableCollection<IForm>,
        @inject(TYPES.FormFactory) private readonly _formFactory: IFormFactory,
        @inject(TYPES.EventEmitter)
        private readonly _eventEmitter: IEventEmitter<any>,
        @inject(TYPES.DebuggingLogger)
        private readonly _logger: IDecoratedLogger
    ) {
        console.log("FormManager: constructor");
    }
    /**
     * Initializes form management by creating form instances from existing DOM
     * and setting up a mutation observer for new forms added to the DOM.
     */
    init(): void {
        this.createForms();
    }
    /**
     * Processes mutation records from a `MutationObserver` and adds any detected new form elements to the form manager.
     * It distinguishes between forms added directly under the observed node and forms nested within other elements.
     * @param {MutationRecord[]} mutationsList - An array of `MutationRecord` objects representing individual mutations.
     * The method iterates over this list, looking for mutations of the `childList` type, which indicate added or removed nodes.
     * @example
     * // Typically not called directly, but used as a callback for MutationObserver:
     * const observer = new MutationObserver(handleFormMutations);
     * observer.observe(document.body, { childList: true, subtree: true });
     *
     * // Could also be called manually in a testing context:
     * handleFormMutations([
     *   {
     *     type: 'childList',
     *     addedNodes: [document.createElement('form')],
     *     removedNodes: [],
     *     // other MutationRecord properties...
     *   }
     * ]);
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver} for more information on `MutationObserver`.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord} for details on `MutationRecord`.
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
                        this.addForm(form);
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
                        this.addForm(form);
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

    /**
     * Attempts to add a form to the forms collection.
     * If the form is successfully created and added to the collection,
     * a "formAdded" event is emitted.
     * @param {HTMLFormElement} formElement - The HTML form element to be added to the collection.
     * @throws Will log an error to the injected logger if the form creation fails or an unexpected error occurs.
     */
    addForm(formElement: HTMLFormElement): void {
        try {
            const formResults = this._formFactory.create(formElement);
            if (!formResults.isSuccess) {
                const error = Result.handleError(formResults);
                this._logger
                    .getLogger()
                    .error(`FormManager: addForm: ${error}`);
                return;
            }

            const formResult = Result.handleSuccess(formResults) as IForm;
            if (formResult === undefined) {
                this._logger
                    .getLogger()
                    .error("FormManager: addForm: formResult is undefined");
                return;
            }

            this._formsCollection.addItem(formResult);
            this._eventEmitter.emit("formAdded", formResult);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            this._logger
                .getLogger()
                .error(
                    `FormManager: addForm: Unexpected error: ${errorMessage}`
                );
        }
    }
    /**
     * Iterates over all form elements present in the document and attempts
     * to add each one to the forms collection using the addForm method.
     * Errors during the addition of individual forms are logged and do not
     * halt the process for subsequent forms.
     */
    createForms(): void {
        const forms = document.querySelectorAll("form");
        const formsArray = Array.from(forms);

        for (const formElement of formsArray) {
            try {
                this.addForm(formElement as HTMLFormElement);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                this._logger
                    .getLogger()
                    .error(
                        `FormManager: createForms: Error when adding form: ${errorMessage}`
                    );
                // Optionally continue to next form or handle the error accordingly
            }
        }
    }
}
