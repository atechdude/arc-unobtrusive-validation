import { inject, injectable } from "inversify";
import { IDecoratedLogger, IFormManager } from "./interfaces";
import { TYPES } from "./di/container-types";
@injectable()
export class FormObserver {
    private mutationObserver: MutationObserver | null = null;
    constructor(
        @inject(TYPES.FormManager) private readonly _formManager: IFormManager,
        @inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger)
    {
        _logger.getLogger().info("FormObserver: constructor");
    }

    startObserving(): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        this.mutationObserver = new MutationObserver((mutationsList) => {
            // Call FormManager methods to handle new forms

            this._formManager.handleFormMutations(mutationsList);
        });
        this._logger.getLogger().info("FormObserver: Is Observing");
        this.mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    public stopObserving(): void {
        this.mutationObserver?.disconnect();
    }
}


