import { inject, injectable } from "inversify";
import { IDecoratedLogger, IStateManager } from "../interfaces";
import { TYPES } from "../di/container-types";

@injectable()
/**
 * Manages the state of controls within a form, tracking whether they have been modified.
 */
export class StateManager implements IStateManager {
    private dirtyMap: { [key: string]: boolean } = {};
    private validatedMap: { [key: string]: boolean } = {};
    private initialValues: { [key: string]: string } = {};
    /**
     * Constructs a new instance of the StateManager.
     * @param {IDecoratedLogger} _logger - The logger service for logging information.
     */
    constructor(
        @inject(TYPES.DebuggingLogger)
        private readonly _logger: IDecoratedLogger
    ) {

    }
    /**
     * Marks a control as dirty (modified).
     * @param {string} controlName - The name of the control to mark as dirty.
     */
    makeControlDirty(controlName: string): void {
        this.dirtyMap[controlName] = true;
        this._logger.getLogger().info(`Control ${controlName} is now dirty`);
    }
    /**
     * Checks if a control is marked as dirty (modified).
     * @param {string} controlName - The name of the control to check.
     * @returns {boolean} - True if the control is dirty, otherwise false.
     */
    isControlDirty(controlName: string): boolean {
        this._logger
            .getLogger()
            .info(`Checking if control ${controlName} is dirty`);
        return !!this.dirtyMap[controlName];
    }
    /**
     * Clears the dirty state of a control, marking it as clean (unmodified).
     * @param {string} controlName - The name of the control to clear the dirty state for.
     */
    clearControlDirtyState(controlName: string): void {
        this._logger
            .getLogger()
            .info(`Clearing dirty state for control ${controlName}`);
        delete this.dirtyMap[controlName];
    }
    /**
     * Clears the dirty state for multiple controls at once.
     * @param {string[]} controlNames - An array of control names to clear the dirty state for.
     */
    clearControlsDirtyState(controlNames: string[]): void {
        controlNames.forEach((controlName) => {
            if (
                Object.prototype.hasOwnProperty.call(this.dirtyMap, controlName)
            ) {
                this._logger
                    .getLogger()
                    .info(`Clearing dirty state for control ${controlName}`);
                delete this.dirtyMap[controlName];
            }
        });
    }
    setControlValidated(controlName: string): void {
        this.validatedMap[controlName] = true;
        this._logger.getLogger().info(`Control ${controlName} has been validated`);
    }
    isControlValidated(controlName: string): boolean {
        return !!this.validatedMap[controlName];
    }
    clearControlValidatedState(controlName: string): void {
        delete this.validatedMap[controlName];
        this._logger.getLogger().info(`Cleared validated state for control ${controlName}`);
    }
    clearControlsValidatedState(controlNames: string[]): void {
        controlNames.forEach((controlName) => {
            if (this.validatedMap[controlName]) {
                this.clearControlValidatedState(controlName);
            }
        });
    }
    // Call this method to set the initial value of a control
    setInitialValue(controlName: string, value: string): void {
        this.initialValues[controlName] = value;
    }

    // Call this to check if the value has changed from the initial value
    hasValueChanged(controlName: string, currentValue: string): boolean {
        return this.initialValues[controlName] !== currentValue;
    }
}
