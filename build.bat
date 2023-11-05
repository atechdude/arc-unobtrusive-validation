const existingForm = this._formsCollection.findItem(f => f.formElement === form.formElement);

                if (existingForm) {
                    // If it exists, you may decide to update it or skip adding the new one.
                    continue; // This will skip the rest of the loop and not add the new form
                }

Write-Host "Running Build"
npm run build
npm run webpack-build
npm run copy-dist
export default class UnobtrusiveValidation {
    private static _currentInstance: UnobtrusiveValidation | null = null;
    _logger: IDecoratedLogger | undefined;
    _initializer: IInitializer | undefined;
    _validationRuleRegistry: IValidationRuleRegistry | undefined;
    _options: Partial<IOptions>;

    constructor(options: Partial<IOptions> = {}) {
        this._options = {
            autoInit: true, // Set a default value
            ...options // Override with passed options
        };
        if (this._options.autoInit) {
            this.init().catch(err => console.error("Initialization failed", err));
        }
    }

    async init(): Promise<void> {
        // Merge the provided options with defaults
        const finalOptions: IOptions = {
            debug: false,
            logLevel: "info",

            ...this._options // Use the options saved in the constructor
        };

        if (container.isBound(TYPES.Options)) {
            container.unbind(TYPES.Options);
        }

        // Bind the options to the container
        container.bind<IOptions>(TYPES.Options).toConstantValue(finalOptions);

        // Get the logger from the container
        this._logger = container.get<IDecoratedLogger>(TYPES.DebuggingLogger);
        // Get the validation rule registry from the container
        this._validationRuleRegistry = container.get<IValidationRuleRegistry>(TYPES.ValidationRuleRegistry);

        // Get the initializer from the container
        this._initializer = container.get<IInitializer>(TYPES.Initializer);

        this._logger.getLogger().info("UnobtrusiveValidation initialized");
        // Initialize the initializer
        await this._initializer.init();
    }



    public static getInstance(options?: Partial<IOptions>): UnobtrusiveValidation {
        if (!this._currentInstance) {
            this._currentInstance = new UnobtrusiveValidation(options ?? {});
        } else if (options) {
            // Merge the provided options with the existing ones
            this._currentInstance._options = {
                ...this._currentInstance._options,
                ...options
            };
            // If autoInit is specifically set to false, do not auto initialize.
            if (options.autoInit === false) {
                // You can add logic here if you need to handle the stopping of auto initialization
            } else {
                // If autoInit is true or undefined and you want to auto initialize
                this._currentInstance.init().catch(err => console.error("Initialization failed", err));
            }
        }

        return this._currentInstance;
    }



    addCustomRules(rules: IValidationRule[]): void {
        for (const rule of rules) {
            if(this._validationRuleRegistry !== undefined)
            {
                this._validationRuleRegistry.addRule(rule);
            }

        }
    }
}


(async (): Promise<void> => {
    const defaultOptions: Partial<IOptions> = {
        autoInit: true
    };

    // Use the static method `getInstance` to ensure we get the singleton instance.
    // Since `getInstance` is now async, we use `await`.
    await UnobtrusiveValidation.getInstance(defaultOptions);
    // The `init` call inside `getInstance` should handle the initialization.
})();

