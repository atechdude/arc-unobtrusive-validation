import { inject, injectable } from "inversify";
import { TYPES } from "./di/container-types";
import { IDecoratedLogger, IStateManager } from "./interfaces";
@injectable()
export class StateManager implements IStateManager {
    private dirtyMap: { [key: string]: boolean } = {};
    constructor( @inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger) {

    }
    makeControlDirty(controlName: string): void {
        this.dirtyMap[controlName] = true;
        this._logger.getLogger().info(`Control ${controlName} is now dirty`);
    }

    isControlDirty(controlName: string): boolean {
        this._logger.getLogger().info(`Checking if control ${controlName} is dirty`);
        return !!this.dirtyMap[controlName];
    }

    clearControlDirtyState(controlName: string): void {
        this._logger.getLogger().info(`Clearing dirty state for control ${controlName}`);
        delete this.dirtyMap[controlName];
    }
    clearControlsDirtyState(controlNames: string[]): void {
        controlNames.forEach(controlName => {
            if (this.dirtyMap[controlName]) {
                this._logger.getLogger().info(`Clearing dirty state for control ${controlName}`);
                delete this.dirtyMap[controlName];
            }
        });
    }
}