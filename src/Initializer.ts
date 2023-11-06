
import { inject, injectable } from "inversify";
import { IAppEvents, IEventEmitter, IEventService, IFormManager, IFormObserver, IInitializer, IOptions, IStateManager } from "./interfaces";
import { TYPES } from "./di/container-types";

@injectable()
export class Initializer implements IInitializer {
    constructor(
        @inject(TYPES.Options) private readonly _options: IOptions,
        @inject(TYPES.FormManager) private readonly _formManager: IFormManager,
        @inject(TYPES.FormObserver) private readonly _formObserver: IFormObserver,
        @inject(TYPES.EventService) private readonly _eventService: IEventService,
        @inject(TYPES.StateManager) private readonly _stateManager: IStateManager,
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
        this._formObserver.startObserving();
        this._formManager.init();

    }
}
