
import { inject, injectable } from "inversify";
import { IAppEvents, IEventEmitter, IFormManager, IInitializer, IOptions } from "./interfaces";
import { TYPES } from "./di/container-types";

@injectable()
export class Initializer implements IInitializer {
    constructor(
        @inject(TYPES.Options) private readonly _options: IOptions,

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
}
