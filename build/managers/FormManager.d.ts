import { IDecoratedLogger, IEventEmitter, IForm, IFormFactory, IFormManager, IObservableCollection, IStateManager } from "../interfaces";
export declare class FormManager implements IFormManager {
    private readonly _formsCollection;
    private readonly _formFactory;
    private readonly _stateManager;
    private readonly _eventEmitter;
    private readonly _logger;
    private mutationObserver;
    constructor(_formsCollection: IObservableCollection<IForm>, _formFactory: IFormFactory, _stateManager: IStateManager, _eventEmitter: IEventEmitter<any>, _logger: IDecoratedLogger);
    /**
     * Initializes form management by creating form instances from existing DOM
     * and setting up a mutation observer for new forms added to the DOM.
     */
    init(): void;
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
    handleFormMutations(mutationsList: MutationRecord[]): void;
    /**
     * Attempts to add a form to the forms collection.
     * If the form does not have any data-val attributes, it is ignored.
     * If the form is successfully created and added to the collection,
     * a "formAdded" event is emitted.
     * @param {HTMLFormElement} formElement - The HTML form element to be added to the collection.
     * @throws Will log an error to the injected logger if the form creation fails or an unexpected error occurs.
     */
    addForm(formElement: HTMLFormElement): void;
    /**
     * Iterates over all form elements present in the document and attempts
     * to add each one to the forms collection using the addForm method.
     * Errors during the addition of individual forms are logged and do not
     * halt the process for subsequent forms.
     */
    createForms(): void;
    getFormByName(formName: string): IForm | undefined;
}
