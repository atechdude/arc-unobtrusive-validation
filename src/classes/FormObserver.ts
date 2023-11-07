import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IDecoratedLogger, IFormManager } from "../interfaces";

@injectable()
export class FormObserver {
    private mutationObserver: MutationObserver | null = null;
    constructor(
        @inject(TYPES.FormManager) private readonly _formManager: IFormManager,
        @inject(TYPES.DebuggingLogger)
        private readonly _logger: IDecoratedLogger
    ) {}

    startObserving(): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        this.mutationObserver = new MutationObserver((mutationsList) => {
            // Let the FormManager handle the mutations
            this._formManager.handleFormMutations(mutationsList);
        });
        this._logger.getLogger().info("FormObserver: Is Observing");
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    public stopObserving(): void {
        this.mutationObserver?.disconnect();
    }
}
