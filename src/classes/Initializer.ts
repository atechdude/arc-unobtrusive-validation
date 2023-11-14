import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IDecoratedLogger, IEventService, IFormManager, IFormService, IInitializer, IOptions, ISubmitHandler } from "../interfaces";

/**
 * Initializer class responsible for setting up the form validation system.
 * It initializes form management, starts observing for form changes, and sets up submit handlers.
 */
@injectable()
export class Initializer implements IInitializer {
    constructor(
        @inject(TYPES.Options) private readonly _options: IOptions,
        @inject(TYPES.FormManager) private readonly _formManager: IFormManager,
        @inject(TYPES.FormService) private readonly _formService: IFormService,
        @inject(TYPES.EventService) private readonly _eventService: IEventService,
        @inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger
    ) { }

    /**
     * Initializes the form system. This includes starting the form observer and initializing the form manager.
     * Emits an "Initialized" event upon completion.
     * @returns {Promise<IFormManager>} The initialized FormManager instance.
     */
    async init(): Promise<void> {
        // If the DOM is already loaded
        if (document.readyState === "loading") {
            // The document is still loading, add an event listener
            document.addEventListener("DOMContentLoaded", () => {
                this.onDOMLoaded();
            });
        } else {
            // The DOM is already loaded
            await this.onDOMLoaded();
        }
    }

    /**
     * Handles tasks to be performed once the DOM is fully loaded.
     * This includes starting form observation and initiating the form manager.
     */
    private async onDOMLoaded(): Promise<void> {
        await this._formManager.init();
    }

    /**
     * Asynchronously assigns a custom submit handler to a form identified by its unique name.
     * This method ensures that the specified submit handler is associated with the named form,
     * whether the form currently exists in the DOM or is added later.
     *
     * - If the form is already loaded and recognized by the FormService, the submit handler is
     * attached immediately to provide custom submit logic for that form.
     * - If the form is not yet loaded or recognized, the handler is stored and will be applied
     * automatically once the form becomes available, ensuring seamless integration with dynamically
     * loaded forms.
     *
     * This method is particularly useful for setting up custom submission behaviors for forms,
     * allowing for asynchronous validation, data processing, or any other custom logic that needs
     * to be executed upon form submission.
     * @param {string} formName - The name of the form to which the submit handler will be applied.
     *                            This name should match the 'name' attribute of the form element.
     * @param {ISubmitHandler} handler - A callback function that defines the custom submit logic.
     *                                   The handler function receives the form element and a boolean
     *                                   indicating the validation status as arguments.
     * @returns {Promise<void>} - A promise that resolves when the handler is successfully set, or
     *                            rejects with an error if unable to set the handler.
     * @throws {Error} - Throws an error if an exception occurs during the execution of the method.
     */
    async setSubmitHandler(formName: string, handler: ISubmitHandler): Promise<void> {
        try {
            this._formService.setSubmitHandler(formName, handler);
            return;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this._logger?.getLogger().error(`Error in setSubmitHandler: ${errorMessage}`);
            throw error; // Rethrowing for potential higher-level handling
        }
    }
}
