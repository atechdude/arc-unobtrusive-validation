
import { inject, injectable } from "inversify";
import { IAppEvents, IEventEmitter, IFormManager, IInitializer, IOptions, IRuleService, IValidationRule } from "./interfaces";
import { TYPES } from "./di/container-types";

@injectable()
export class Initializer implements IInitializer {
    constructor(
        @inject(TYPES.Options) private readonly _options: IOptions,
        @inject(TYPES.RuleService) private readonly _ruleService: IRuleService,
        @inject(TYPES.FormManager) private readonly _formManager: IFormManager,
        @inject(TYPES.EventEmitter) private readonly _eventEmitter: IEventEmitter<IAppEvents>) {
    }

    async init(): Promise<void> {
        // If the DOM is already loaded
        if (document.readyState === "loading") {
            // The document is still loading, add an event listener
            document.addEventListener("DOMContentLoaded", () => {
                this.onDOMLoaded();
            });
        } else {
            // The DOM is already loaded
            this.onDOMLoaded();
        }

        this._eventEmitter.emit("Initialized", {
            source: "Initializer",
            message: "System Intialized"
        });
    }

    private async onDOMLoaded(): Promise<void> {
        // Your logic for when the DOM is loaded
        await this._formManager.init();

    }
    /* private registerValidationRules(): void {
        // Get the Rule Service from the container
        const requiredRule: IValidationRule = {
            type: "required",
            message: "This field is required",
            validate: (value: string): boolean => {
                if (!value) {
                    return false;
                }
                return true;
            }
        } as IValidationRule;
        // Example of registering a rule, you would add all your rules here
        //this._ruleService.registerRule(
        // Repeat for each rule you need to register
    } */

}

/* export class RequiredRule implements IValidationRule {
    type = 'required';
    message: string;

    constructor(attributes: { message: string }) {
        this.message = attributes.message;
    }

    validate(value: string): boolean {
        return value.trim().length > 0;
    }
} */
